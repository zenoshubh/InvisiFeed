"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/db-connect";
import OwnerModel from "@/models/owner";
import InvoiceModel from "@/models/invoice";
import crypto from "crypto";
import { extractInvoiceNumberFromPdf } from "@/utils/upload-invoice-utils/extract-invoice-number";
import { generateQrPdf } from "@/utils/upload-invoice-utils/generate-qr-pdf";
import { mergePdfs } from "@/utils/upload-invoice-utils/merge-pdfs";
import sendInvoiceToMail from "@/utils/send-invoice-to-mail";
import { generateInvoicePdf } from "@/utils/pdf-generator";
import { uploadToCloudinary } from "@/lib/cloudinary";

// Validate coupon data
function validateCouponData(couponData) {
  if (!couponData) return null;

  if (!couponData.couponCode || typeof couponData.couponCode !== "string") {
    throw new Error("Invalid coupon code format");
  }

  if (couponData.couponCode.includes(" ")) {
    throw new Error("Coupon code must not contain spaces");
  }

  if (!couponData.description || typeof couponData.description !== "string") {
    throw new Error("Invalid coupon description format");
  }

  if (couponData.couponCode.length < 3 || couponData.couponCode.length > 10) {
    throw new Error("Coupon code must be between 3 and 10 characters");
  }

  if (
    couponData.description.length < 10 ||
    couponData.description.length > 200
  ) {
    throw new Error("Coupon description must be between 10 and 200 characters");
  }

  if (couponData.expiryDays < 1 || couponData.expiryDays > 365) {
    throw new Error("Expiry days must be between 1 and 365");
  }

  if (!/^[A-Z0-9]+$/.test(couponData.couponCode)) {
    throw new Error(
      "Coupon code must contain only uppercase letters and numbers"
    );
  }

  return true;
}

export async function uploadInvoice(formData) {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return { success: false, message: "Unauthorized" };
    }

    const file = formData.get("file");
    const username = session?.user?.username;
    const couponDataStr = formData.get("couponData");

    let couponData = null;
    if (couponDataStr) {
      try {
        couponData = JSON.parse(couponDataStr);
        validateCouponData(couponData);
      } catch (error) {
        return {
          success: false,
          message: `Invalid coupon data: ${error.message}`,
        };
      }
    }

    if (!file) {
      return { success: false, message: "No file uploaded" };
    }

    const owner = await OwnerModel.findOne({ username });
    if (!owner) {
      return { success: false, message: "Owner not found" };
    }

    // Check daily upload limit
    const uploadCount = owner.dailyUploadCount || 0;
    const dailyLimit =
      owner.plan?.planName === "pro" && owner.plan?.planEndDate > new Date()
        ? 10
        : 3;

    if (uploadCount >= dailyLimit) {
      return {
        success: false,
        message: `Daily upload limit of ${dailyLimit} reached`,
        dailyLimit,
      };
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract invoice details including customer info
    const extractedData = await extractInvoiceNumberFromPdf(buffer);

    if (!extractedData || !extractedData.invoiceId) {
      return {
        success: false,
        message: "Failed to extract invoice number from PDF",
      };
    }

    const extractedInvoiceNumber = extractedData.invoiceId;

    // Check for duplicate invoice
    const existingInvoice = await InvoiceModel.findOne({
      owner: owner._id,
      invoiceNumber: extractedInvoiceNumber,
    });

    if (existingInvoice) {
      return {
        success: false,
        message: `Invoice ${extractedInvoiceNumber} already exists`,
      };
    }

    // Generate feedback URL and QR PDF with coupon handling
    let modifiedCouponCodeforURL = null;
    if (couponData) {
      const hash = crypto
        .createHash("sha256")
        .update(couponData.couponCode + owner._id.toString())
        .digest("hex")
        .substring(0, 8);
      modifiedCouponCodeforURL = `${couponData.couponCode.substring(
        0,
        3
      )}-${hash}`;
    }

    // Generate QR Code PDF
    const { pdf: qrPdfBuffer, feedbackUrl } = await generateQrPdf(
      extractedInvoiceNumber,
      username,
      modifiedCouponCodeforURL,
      owner
    );

    // Merge PDFs
    const mergedPdfBuffer = await mergePdfs(buffer, qrPdfBuffer);

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(mergedPdfBuffer, {
      folder: "invoices",
      public_id: `${username}_${extractedInvoiceNumber}_${Date.now()}`,
      resource_type: "raw",
      format: "pdf",
    });

    // Create invoice in database
    const newInvoice = new InvoiceModel({
      invoiceId: extractedInvoiceNumber,
      owner: owner._id,
      customerDetails: {
        customerName:
          extractedData.customerName !== "Not Found" &&
          extractedData.customerName !== "Extraction Failed"
            ? extractedData.customerName
            : null,
        customerEmail:
          extractedData.customerEmail !== "Not Found" &&
          extractedData.customerEmail !== "Extraction Failed"
            ? extractedData.customerEmail
            : null,
        amount:
          extractedData.totalAmount !== "Not Found" &&
          extractedData.totalAmount !== "Extraction Failed" &&
          !isNaN(parseFloat(extractedData.totalAmount))
            ? parseFloat(extractedData.totalAmount)
            : null,
      },
      mergedPdfUrl: uploadResult.secure_url,
      coupon: couponData
        ? {
            couponCode: couponData.couponCode,
            couponDescription: couponData.description,
            couponExpiryDate: new Date(
              Date.now() + parseInt(couponData.expiryDays) * 24 * 60 * 60 * 1000
            ),
          }
        : null,
    });

    await newInvoice.save();

    // Update owner's daily upload count
    owner.dailyUploadCount = uploadCount + 1;
    await owner.save();

    return {
      success: true,
      message: "Invoice uploaded successfully",
      data: {
        invoiceNumber: extractedInvoiceNumber,
        pdfUrl: uploadResult.secure_url,
        feedbackUrl,
        customerName: extractedData.customerName,
        customerEmail: extractedData.customerEmail,
        customerAmount: extractedData.totalAmount,
        dailyUploadCount: owner.dailyUploadCount,
      },
    };
  } catch (error) {
    console.error("Error uploading invoice:", error);
    return { success: false, message: "Failed to upload invoice" };
  }
}

export async function getUploadCount() {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return { success: false, message: "Unauthorized" };
    }

    const username = session?.user?.username;
    const owner = await OwnerModel.findOne({ username });

    if (!owner) {
      return { success: false, message: "Owner not found" };
    }

    const isProPlan =
      owner?.plan?.planName === "pro" &&
      owner?.plan?.planEndDate > new Date();

    // Calculate time remaining if daily limit is reached
    let timeLeft = null;
    const now = new Date();
    const lastReset = new Date(owner.uploadedInvoiceCount.lastDailyReset);
    const hoursSinceLastReset = (now - lastReset) / (1000 * 60 * 60);

    if (hoursSinceLastReset > 24) {
      owner.uploadedInvoiceCount.dailyUploadCount = 0;
      await owner.save();
    }

    if (isProPlan && owner.uploadedInvoiceCount.dailyUploadCount >= 10) {
      timeLeft = Math.ceil(24 - hoursSinceLastReset);
    }

    if (!isProPlan && owner.uploadedInvoiceCount.dailyUploadCount >= 3) {
      timeLeft = Math.ceil(24 - hoursSinceLastReset);
    }

    return {
      success: true,
      message: "Upload count fetched successfully",
      data: {
        dailyUploadCount: owner.uploadedInvoiceCount.dailyUploadCount,
        timeLeft,
        dailyLimit: isProPlan ? 10 : 3,
      },
    };
  } catch (error) {
    console.error("Error fetching upload count:", error);
    return { success: false, message: "Internal server error" };
  }
}
