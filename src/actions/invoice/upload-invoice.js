"use server";

import dbConnect from "@/lib/db-connect";
import InvoiceModel from "@/models/invoice";
import crypto from "crypto";
import { extractInvoiceNumberFromPdf } from "@/utils/upload-invoice-utils/extract-invoice-number";
import { generateQrPdf } from "@/utils/upload-invoice-utils/generate-qr-pdf";
import { mergePdfs } from "@/utils/upload-invoice-utils/merge-pdfs";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { getAuthenticatedOwnerDocument } from "@/lib/auth/session-utils";
import { parseAndValidateCouponData } from "@/schemas/coupon";
import { checkDailyUploadLimit, incrementDailyUploadCount, getDailyUploadLimit, checkAndResetDailyUploads } from "@/utils/invoice/upload-limit";
import { successResponse, errorResponse } from "@/utils/response";

export async function uploadInvoice(formData) {
  await dbConnect();

  try {
    // Get authenticated owner
    const ownerResult = await getAuthenticatedOwnerDocument();
    if (!ownerResult.success) {
      return errorResponse(ownerResult.message);
    }
    const { owner, username } = ownerResult;

    const file = formData.get("file");
    const couponDataStr = formData.get("couponData");

    // Validate coupon data if provided
    let couponData = null;
    if (couponDataStr) {
      const couponValidation = parseAndValidateCouponData(couponDataStr);
      if (!couponValidation.success) {
        return errorResponse(`Invalid coupon data: ${couponValidation.message}`);
      }
      couponData = couponValidation.data;
    }

    if (!file) {
      return errorResponse("No file uploaded");
    }

    // Check daily upload limit
    const limitCheck = await checkDailyUploadLimit(owner);
    if (!limitCheck.success) {
      return errorResponse(limitCheck.message, {
        timeLeft: limitCheck.timeLeft,
        dailyLimit: limitCheck.dailyLimit,
      });
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
      invoiceId: extractedInvoiceNumber,
    });

    if (existingInvoice) {
      return errorResponse(`Invoice ${extractedInvoiceNumber} already exists`);
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

    // Increment daily upload count
    const uploadCountResult = await incrementDailyUploadCount(owner);

    return successResponse("Invoice uploaded successfully", {
      invoiceNumber: extractedInvoiceNumber,
      pdfUrl: uploadResult.secure_url,
      feedbackUrl,
      customerName: extractedData.customerName,
      customerEmail: extractedData.customerEmail,
      customerAmount: extractedData.totalAmount,
      dailyUploadCount: uploadCountResult.dailyUploadCount,
      dailyLimit: uploadCountResult.dailyLimit,
    });
  } catch (error) {
    console.error("Error uploading invoice:", error);
    return errorResponse("Failed to upload invoice");
  }
}

export async function getUploadCount() {
  await dbConnect();

  try {
    const ownerResult = await getAuthenticatedOwnerDocument();
    if (!ownerResult.success) {
      return errorResponse(ownerResult.message);
    }
    const { owner } = ownerResult;

    const resetResult = await checkAndResetDailyUploads(owner);
    const dailyLimit = getDailyUploadLimit(owner);
    const currentCount = owner.uploadedInvoiceCount.dailyUploadCount;

    // Calculate time left if limit is reached
    let timeLeft = null;
    if (currentCount >= dailyLimit) {
      timeLeft = resetResult.timeLeft;
    }

    return successResponse("Upload count fetched successfully", {
      dailyUploadCount: currentCount,
      timeLeft,
      dailyLimit,
    });
  } catch (error) {
    console.error("Error fetching upload count:", error);
    return errorResponse("Internal server error");
  }
}
