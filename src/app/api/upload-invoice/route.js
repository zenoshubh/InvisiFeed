import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import crypto from "crypto";
import { extractInvoiceNumberFromPdf } from "@/utils/upload-invoice-utils/extract-invoice-number";
import { generateQrPdf } from "@/utils/upload-invoice-utils/generate-qr-pdf";
import { mergePdfs } from "@/utils/upload-invoice-utils/merge-pdfs";
import InvoiceModel from "@/models/invoice";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { getAuthenticatedOwnerDocument } from "@/lib/auth/session-utils";
import { parseAndValidateCouponData } from "@/schemas/coupon";
import { checkDailyUploadLimit, incrementDailyUploadCount } from "@/utils/invoice/upload-limit";

export async function POST(req) {
  await dbConnect();

  try {
    // Get authenticated owner
    const ownerResult = await getAuthenticatedOwnerDocument();
    if (!ownerResult.success) {
      return NextResponse.json(
        { success: false, message: ownerResult.message },
        { status: 401 }
      );
    }
    const { owner, username } = ownerResult;

    const formData = await req.formData();
    const file = formData.get("file");
    const couponDataStr = formData.get("couponData");

    // Validate coupon data if provided
    let couponData = null;
    if (couponDataStr) {
      const couponValidation = parseAndValidateCouponData(couponDataStr);
      if (!couponValidation.success) {
        return NextResponse.json(
          { success: false, message: `Invalid coupon data: ${couponValidation.message}` },
          { status: 400 }
        );
      }
      couponData = couponValidation.data;
    }

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    // Check daily upload limit
    const limitCheck = await checkDailyUploadLimit(owner);
    if (!limitCheck.success) {
      return NextResponse.json(
        {
          success: false,
          message: limitCheck.message,
          timeLeft: limitCheck.timeLeft,
        },
        { status: 429 }
      );
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

    // Increment daily upload count
    const uploadCountResult = await incrementDailyUploadCount(owner);

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
        dailyUploadCount: uploadCountResult.dailyUploadCount,
        dailyLimit: uploadCountResult.dailyLimit,
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
