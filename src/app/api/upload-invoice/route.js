import { NextResponse } from "next/server";
import OwnerModel from "@/models/owner";
import dbConnect from "@/lib/db-connect";
import crypto from "crypto";
import { extractInvoiceNumberFromPdf } from "@/utils/upload-invoice-utils/extract-invoice-number";
import { generateQrPdf } from "@/utils/upload-invoice-utils/generate-qr-pdf";
import { mergePdfs } from "@/utils/upload-invoice-utils/merge-pdfs";
import InvoiceModel from "@/models/invoice";
import { authOptions } from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

// Validate coupon data against schema
function validateCouponData(couponData) {
  if (!couponData) return null;

  // Required fields validation
  if (!couponData.couponCode || typeof couponData.couponCode !== "string") {
    throw new Error("Invalid coupon code format");
  }

  if (couponData.couponCode.includes(" ")) {
    throw new Error("Coupon code must not contain spaces");
  }

  if (!couponData.description || typeof couponData.description !== "string") {
    throw new Error("Invalid coupon description format");
  }

  // Length validations
  if (couponData.couponCode.length < 3 || couponData.couponCode.length > 10) {
    throw new Error("Coupon code must be between 3 and 10 characters");
  }

  if (
    couponData.description.length < 10 ||
    couponData.description.length > 200
  ) {
    throw new Error("Coupon description must be between 10 and 200 characters");
  }

  // Expiry days validation
  if (couponData.expiryDays < 1 || couponData.expiryDays > 365) {
    throw new Error("Expiry days must be between 1 and 365");
  }

  // Format validations
  if (!/^[A-Z0-9]+$/.test(couponData.couponCode)) {
    throw new Error(
      "Coupon code must contain only uppercase letters and numbers"
    );
  }

  return true;
}

export async function POST(req) {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const username = session?.user?.username;
    const couponDataStr = formData.get("couponData");

    let couponData = null;
    if (couponDataStr) {
      try {
        couponData = JSON.parse(couponDataStr);
        // Validate coupon data against schema
        validateCouponData(couponData);
      } catch (error) {
        return NextResponse.json(
          { success: false, message: `Invalid coupon data: ${error.message}` },
          { status: 400 }
        );
      }
    }

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    // Check owner exists or not
    const owner = await OwnerModel.findOne({ username });
    if (!owner) {
      return NextResponse.json(
        { success: false, message: "Owner not found" },
        { status: 404 }
      );
    }

    // Check daily upload limit
    const now = new Date();
    const lastReset = new Date(owner.uploadedInvoiceCount.lastDailyReset);
    const hoursSinceLastReset = (now - lastReset) / (1000 * 60 * 60);
    const timeLeft = 24 - hoursSinceLastReset;
    const hoursLeft = Math.ceil(timeLeft);

    // Reset daily uploads if 24 hours have passed
    if (hoursSinceLastReset >= 24) {
      owner.uploadedInvoiceCount.dailyUploadCount = 0;
      owner.uploadedInvoiceCount.lastDailyReset = now;
    }

    // Check if daily limit reached
    const isProPlan =
      owner?.plan?.planName === "pro" && owner?.plan?.planEndDate > new Date();
    if (isProPlan) {
      if (owner.uploadedInvoiceCount.dailyUploadCount >= 10) {
        return NextResponse.json(
          {
            success: false,
            message: `Daily upload limit reached. Please try again after ${hoursLeft} hours.`,
            timeLeft: hoursLeft,
          },
          { status: 429 }
        );
      }
    }

    if (!isProPlan) {
      if (owner.uploadedInvoiceCount.dailyUploadCount >= 3) {
        return NextResponse.json(
          {
            success: false,
            message: `Daily upload limit reached. Please try again after ${hoursLeft} hours. Upgrade to pro plan to increase daily upload limit`,
            timeLeft: hoursLeft,
          },
          { status: 429 }
        );
      }
    }

    const invoiceData = await extractInvoiceNumberFromPdf(file);
    if (
      !invoiceData.invoiceId ||
      invoiceData.invoiceId === "Not Found" ||
      invoiceData.invoiceId === "Extraction Failed"
    ) {
      return NextResponse.json(
        { success: false, message: "Invoice number not found" },
        { status: 400 }
      );
    }

    const existedInvoice = await InvoiceModel.findOne({
      invoiceId: invoiceData.invoiceId,
      owner: owner._id,
    });

    if (existedInvoice) {
      return NextResponse.json(
        { success: false, message: "Invoice already exists" },
        { status: 400 }
      );
    }

    // If all checks pass, proceed with Cloudinary upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Handle coupon data if provided
    let modifiedCouponCodeforURL = null;
    const expiryDate = new Date();
    let dbCouponCode = null;

    if (couponData) {
      // Generate 4 random characters
      const randomChars = Array.from(
        { length: 4 },
        () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[crypto.randomInt(0, 36)]
      ).join("");

      // Modify coupon code by adding random chars at start and invoice count
      dbCouponCode = `${couponData.couponCode}${
        (await InvoiceModel.countDocuments({})) + 1
      }`;
      modifiedCouponCodeforURL = `${randomChars}${couponData.couponCode}${
        (await InvoiceModel.countDocuments({})) + 1
      }`;

      // Calculate expiry date
      expiryDate.setDate(expiryDate.getDate() + Number(couponData.expiryDays));
    }

    // Generate QR Code PDF with modified coupon code if provided
    const { pdf, feedbackUrl } = await generateQrPdf(
      invoiceData.invoiceId,
      username,
      modifiedCouponCodeforURL,
      owner
    );
    const mergedPdfBuffer = await mergePdfs(buffer, pdf);

    // Upload Final Merged PDF to Cloudinary
    const sanitiseString = (str) => {
      return str.replace(/[^a-zA-Z0-9-_\.]/g, "_");
    };

    const sanitizedInvoiceNumber = sanitiseString(invoiceData.invoiceId);

    const finalUpload = await uploadToCloudinary(mergedPdfBuffer, {
      folder: "invoice_pdf_uploads",
      resource_type: "raw",
      public_id: `invoice_${sanitizedInvoiceNumber}_${username}_${Date.now()}`,
      format: "pdf",
      context: "ttl=20",
    });

    const finalPdfUrl = finalUpload.secure_url;

    // Add new invoice with initial AIuseCount, coupon if provided, and PDF URLs
    const newInvoice = new InvoiceModel({
      invoiceId: invoiceData.invoiceId,
      owner: owner._id,
      customerDetails: {
        customerName: invoiceData.customerName,
        customerEmail: invoiceData.customerEmail,
        amount:
          invoiceData.totalAmount !== "Not Found"
            ? parseFloat(invoiceData.totalAmount).toFixed(2)
            : null,
      },
      mergedPdfUrl: finalPdfUrl,
      AIuseCount: 0,
      couponAttached: couponData
        ? {
            couponCode: dbCouponCode,
            couponDescription: couponData.description,
            couponExpiryDate: expiryDate,
            isCouponUsed: false,
          }
        : null,
    });

    await newInvoice.save();

    // Update upload counts
    owner.uploadedInvoiceCount.dailyUploadCount += 1;

    await owner.save();

    return NextResponse.json(
      {
        success: true,
        message: "Invoice uploaded successfully",
        url: finalPdfUrl,
        invoiceNumber: invoiceData.invoiceId,
        customerName: invoiceData.customerName,
        customerEmail: invoiceData.customerEmail,
        customerAmount:
          invoiceData.totalAmount !== "Not Found"
            ? parseFloat(invoiceData.totalAmount).toFixed(2)
            : null,
        feedbackUrl,
        dailyUploadCount: owner.uploadedInvoiceCount.dailyUploadCount,
        timeLeft: hoursLeft,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
