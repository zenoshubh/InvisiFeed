"use server";

import dbConnect from "@/lib/db-connect";
import InvoiceModel from "@/models/invoice";
import CouponModel from "@/models/coupon";
import crypto from "crypto";
import { extractInvoiceNumberFromPdf } from "@/utils/upload-invoice-utils/extract-invoice-number";
import { generateQrPdf } from "@/utils/upload-invoice-utils/generate-qr-pdf";
import { mergePdfs } from "@/utils/upload-invoice-utils/merge-pdfs";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { getAuthenticatedBusinessDocument, getAuthenticatedBusiness } from "@/lib/auth/session-utils";
import { parseAndValidateCouponData } from "@/schemas/coupon";
import { checkDailyUploadLimit, incrementDailyUploadCount, getDailyUploadLimit, checkAndResetDailyUploads } from "@/utils/invoice/upload-limit";
import { successResponse, errorResponse } from "@/utils/response";

export async function uploadInvoice(formData) {
  await dbConnect();

  try {
    // Get authenticated business
    const businessResult = await getAuthenticatedBusinessDocument();
    if (!businessResult.success) {
      return errorResponse(businessResult.message);
    }
    const { business, username } = businessResult;

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
    const limitCheck = await checkDailyUploadLimit(business);
    if (!limitCheck.success) {
      return errorResponse(limitCheck.message, {
        timeLeft: limitCheck.timeLeft,
        dailyLimit: limitCheck.dailyLimit,
      });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate PDF buffer - check for PDF header
    if (buffer.length === 0) {
      return errorResponse("Uploaded file is empty");
    }

    // Check if buffer starts with PDF header (%PDF) - allow some flexibility
    // Some PDFs might have whitespace or different encoding
    const firstBytes = buffer.slice(0, 10).toString('ascii', 0, 10);
    const hasPdfHeader = firstBytes.includes('%PDF');
    
    if (!hasPdfHeader) {
      // Also check file extension as fallback
      const fileName = file.name || '';
      const isPdfExtension = fileName.toLowerCase().endsWith('.pdf');
      
      if (!isPdfExtension) {
        return errorResponse("Invalid file type. Please upload a PDF file.");
      }
      // If it has .pdf extension but no header, still try to process it
      // (might be a corrupted but recoverable PDF)
    }

    // Extract invoice details including customer info
    const extractedData = await extractInvoiceNumberFromPdf(buffer);

    if (!extractedData || !extractedData.invoiceId || extractedData.invoiceId === "Extraction Failed" || extractedData.invoiceId === "Extraction Failed - Invalid PDF") {
      const errorMessage = extractedData?.invoiceId === "Extraction Failed - Invalid PDF"
        ? "Invalid PDF file. Please ensure the file is a valid PDF document."
        : "Failed to extract invoice number from PDF. Please ensure the PDF contains invoice information.";
      return errorResponse(errorMessage);
    }

    const extractedInvoiceNumber = extractedData.invoiceId;

    // Check for duplicate invoice (read-only check)
    const existingInvoice = await InvoiceModel.findOne({
      business: business._id,
      invoiceId: extractedInvoiceNumber,
    })
      .select("_id")
      .lean();

    if (existingInvoice) {
      return errorResponse(`Invoice ${extractedInvoiceNumber} already exists`);
    }

    // Generate feedback URL and QR PDF with coupon handling
    let modifiedCouponCodeforURL = null;
    if (couponData) {
      const hash = crypto
        .createHash("sha256")
        .update(couponData.couponCode + business._id.toString())
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
      business
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

    // Create coupon document if coupon data is provided
    let couponId = null;
    if (couponData) {
      // Generate coupon code for database (matching API route format)
      const invoiceCount = await InvoiceModel.countDocuments({}).lean();
      const dbCouponCode = `${couponData.couponCode}${invoiceCount + 1}`;
      
      // Calculate expiry date
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + parseInt(couponData.expiryDays));

      // Create coupon document
      const newCoupon = new CouponModel({
        business: business._id,
        couponCode: dbCouponCode,
        description: couponData.description,
        expiryDate: expiryDate,
        isActive: true,
        isUsed: false,
        usageCount: 0,
        maxUsage: 1,
      });

      const savedCoupon = await newCoupon.save();
      couponId = savedCoupon._id;
    }

    // Create invoice in database
    const newInvoice = new InvoiceModel({
      invoiceId: extractedInvoiceNumber,
      business: business._id,
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
      coupon: couponId, // Use Coupon ObjectId instead of object
    });

    await newInvoice.save();

    // Update coupon with invoice reference if coupon exists
    if (couponId) {
      await CouponModel.findByIdAndUpdate(couponId, {
        invoice: newInvoice._id,
      }).lean();
    }

    // Increment daily upload count
    const uploadCountResult = await incrementDailyUploadCount(business);

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
    // Use lean version since we only need to read data
    const businessResult = await getAuthenticatedBusiness();
    if (!businessResult.success) {
      return errorResponse(businessResult.message);
    }
    const { business } = businessResult;

    const resetResult = await checkAndResetDailyUploads(business);
    const dailyLimit = getDailyUploadLimit(business);
    
    // Get current count from UsageTracker
    const UsageTrackerModel = (await import("@/models/usage-tracker")).default;
    const tracker = await UsageTrackerModel.findOne({
      business: business._id,
      usageType: "invoice-upload",
    }).lean();
    
    const currentCount = tracker?.dailyUploadCount || 0;

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
