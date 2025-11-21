"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/db-connect";
import OwnerModel from "@/models/owner";
import InvoiceModel from "@/models/invoice";
import cloudinary from "cloudinary";
import crypto from "crypto";
import { extractInvoiceNumberFromPdf } from "@/utils/upload-invoice-utils/extract-invoice-number";
import { generateQrPdf } from "@/utils/upload-invoice-utils/generate-qr-pdf";
import { mergePdfs } from "@/utils/upload-invoice-utils/merge-pdfs";
import sendInvoiceToMail from "@/utils/send-invoice-to-mail";
import { generateInvoicePdf } from "@/utils/pdf-generator";

// Cloudinary Config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "invoices",
          public_id: `${username}_${extractedInvoiceNumber}_${Date.now()}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(mergedPdfBuffer);
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

export async function sendInvoiceEmail({
  customerEmail,
  invoiceNumber,
  pdfUrl,
  companyName,
  feedbackUrl,
}) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return { success: false, message: "Unauthorized" };
    }

    if (!customerEmail || !invoiceNumber || !pdfUrl || !feedbackUrl) {
      return { success: false, message: "Missing required fields" };
    }

    const result = await sendInvoiceToMail(
      customerEmail,
      invoiceNumber,
      pdfUrl,
      companyName,
      feedbackUrl
    );

    if (result.success) {
      return { success: true, message: "Email sent successfully" };
    } else {
      return {
        success: false,
        message: result.error || "Failed to send email",
      };
    }
  } catch (error) {
    console.error("Error sending invoice email:", error);
    return { success: false, message: "Internal server error" };
  }
}

export async function createInvoice(invoiceData) {
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

    // Validate required fields
    const {
      companyName,
      companyAddress,
      customerName,
      customerAddress,
      invoiceNumber,
      invoiceDate,
      items,
      couponData,
    } = invoiceData;

    if (
      !companyName ||
      !customerName ||
      !invoiceNumber ||
      !invoiceDate ||
      !items ||
      items.length === 0
    ) {
      return { success: false, message: "Missing required fields" };
    }

    // Check for duplicate invoice
    const existingInvoice = await InvoiceModel.findOne({
      owner: owner._id,
      invoiceNumber,
    });

    if (existingInvoice) {
      return {
        success: false,
        message: `Invoice ${invoiceNumber} already exists`,
      };
    }

    // Validate coupon data if provided
    if (couponData) {
      try {
        validateCouponData(couponData);
      } catch (error) {
        return {
          success: false,
          message: `Invalid coupon data: ${error.message}`,
        };
      }
    }

    // Generate PDF
    const pdfBuffer = await generateInvoicePdf({
      companyName,
      companyAddress: companyAddress || "",
      customerName,
      customerAddress: customerAddress || "",
      invoiceNumber,
      invoiceDate,
      items,
    });

    // Generate feedback URL
    const feedbackId = crypto.randomBytes(16).toString("hex");
    const feedbackUrl = `${process.env.NEXTAUTH_URL}/feedback/${username}?invoiceNumber=${invoiceNumber}&feedbackId=${feedbackId}`;

    // Generate QR PDF
    const qrPdfBuffer = await generateQrPdf(feedbackUrl);

    // Merge PDFs
    const mergedPdfBuffer = await mergePdfs(pdfBuffer, qrPdfBuffer);

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "invoices",
          public_id: `${username}_${invoiceNumber}_${Date.now()}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(mergedPdfBuffer);
    });

    // Create invoice in database
    const newInvoice = new InvoiceModel({
      owner: owner._id,
      invoiceNumber,
      pdfUrl: uploadResult.secure_url,
      feedbackUrl,
      feedbackId,
      customerName,
      totalAmount: items.reduce((sum, item) => sum + item.total, 0),
      coupon: couponData
        ? {
            code: couponData.couponCode,
            description: couponData.description,
            expiryDays: parseInt(couponData.expiryDays),
          }
        : null,
    });

    await newInvoice.save();

    return {
      success: true,
      message: "Invoice created successfully",
      data: {
        invoiceNumber,
        pdfUrl: uploadResult.secure_url,
        feedbackUrl,
      },
    };
  } catch (error) {
    console.error("Error creating invoice:", error);
    return { success: false, message: "Failed to create invoice" };
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

    const dailyLimit =
      owner.plan?.planName === "pro" && owner.plan?.planEndDate > new Date()
        ? 10
        : 3;

    return {
      success: true,
      data: {
        dailyUploadCount: owner.dailyUploadCount || 0,
        dailyLimit,
      },
    };
  } catch (error) {
    console.error("Error fetching upload count:", error);
    return { success: false, message: "Failed to fetch upload count" };
  }
}

export async function resetInvoiceData() {
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

    return {
      success: true,
      message: "Data reset successfully",
    };
  } catch (error) {
    console.error("Error resetting data:", error);
    return { success: false, message: "Failed to reset data" };
  }
}
