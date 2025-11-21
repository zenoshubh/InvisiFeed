"use server";

import dbConnect from "@/lib/db-connect";
import crypto from "crypto";
import { generateInvoicePdf } from "@/utils/pdf";
import InvoiceModel from "@/models/invoice";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { getAuthenticatedOwnerDocument } from "@/lib/auth/session-utils";
import { validateCouponData } from "@/schemas/coupon";
import { checkDailyUploadLimit, incrementDailyUploadCount } from "@/utils/invoice/upload-limit";
import { successResponse, errorResponse } from "@/utils/response";

export async function createInvoice(invoiceData) {
  try {
    await dbConnect();

    const { customerName, customerEmail } = invoiceData;

    // Validate coupon data if provided
    let couponData = invoiceData.coupon;
    if (invoiceData.addCoupon && couponData) {
      const couponValidation = validateCouponData(couponData);
      if (!couponValidation.success) {
        return errorResponse(`Invalid coupon data: ${couponValidation.message}`);
      }
      couponData = couponValidation.data;
    }

    // Get authenticated owner
    const ownerResult = await getAuthenticatedOwnerDocument();
    if (!ownerResult.success) {
      return errorResponse(ownerResult.message);
    }
    const { owner, username } = ownerResult;

    // Check daily upload limit
    const limitCheck = await checkDailyUploadLimit(owner);
    if (!limitCheck.success) {
      return errorResponse(limitCheck.message, {
        timeLeft: limitCheck.timeLeft,
      });
    }

    // Generate invoice number if not provided
    const invoiceNumber =
      invoiceData.invoiceNumber.trim() || `INV-${Date.now()}`;

    // Check if invoice number already exists
    const existedInvoice = await InvoiceModel.findOne({
      invoiceId: invoiceNumber,
      owner: owner._id,
    });

    if (existedInvoice) {
      return errorResponse("Invoice number already exists");
    }

    // Generate QR code
    const encodedUsername = encodeURIComponent(username);
    const encodedInvoiceNumber = encodeURIComponent(invoiceNumber);
    let qrData = `${process.env.NEXT_PUBLIC_APP_URL}/feedback/${encodedUsername}?invoiceNo=${encodedInvoiceNumber}`;

    // Add coupon data if provided
    let modifiedCouponCodeforURL = null;
    let dbCouponCode = null;
    const expiryDate = new Date();
    if (invoiceData.addCoupon && couponData) {
      // Generate 4 random characters
      const randomChars = Array.from(
        { length: 4 },
        () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[crypto.randomInt(0, 36)]
      ).join("");

      // Modify coupon code by adding random chars at start and invoice count
      const invoiceCount = (await InvoiceModel.countDocuments({})) + 1;
      dbCouponCode = `${couponData.couponCode.trim()}${invoiceCount}`;
      modifiedCouponCodeforURL = `${randomChars}${couponData.couponCode.trim()}${invoiceCount}`;
      expiryDate.setDate(
        expiryDate.getDate() + Number(couponData.expiryDays)
      );

      qrData += `&cpcd=${modifiedCouponCodeforURL}`;
    }

    // Calculate totals
    let sub = 0;
    let discount = 0;
    let tax = 0;
    invoiceData.items.forEach((item) => {
      const itemAmount = item.quantity * item.rate;
      const itemDiscount = (itemAmount * item.discount) / 100;
      const itemAfterDiscount = itemAmount - itemDiscount;
      const itemTax = (itemAfterDiscount * item.tax) / 100;

      sub += itemAmount;
      discount += itemDiscount;
      tax += itemTax;
    });
    const subtotal = sub;
    const discountTotal = discount;
    const grandTotal = sub - discount + tax;
    const taxTotal = tax;

    // Generate PDF using react-pdf/renderer
    const pdfBuffer = await generateInvoicePdf(
      invoiceData,
      invoiceNumber,
      qrData,
      subtotal,
      discountTotal,
      taxTotal,
      grandTotal
    );

    // Upload to Cloudinary
    const sanitiseString = (str) => {
      return str.replace(/[^a-zA-Z0-9-_\.]/g, "_");
    };

    const sanitizedInvoiceNumber = sanitiseString(invoiceNumber);

    const uploadResponse = await uploadToCloudinary(pdfBuffer, {
      folder: "invoice_pdf_uploads",
      resource_type: "raw",
      format: "pdf",
      public_id: `invoice_${sanitizedInvoiceNumber}_${username}_${Date.now()}`,
      context: "ttl=20",
    });

    // Save invoice to database
    const newInvoice = new InvoiceModel({
      invoiceId: invoiceNumber,
      owner: owner._id,
      customerDetails: {
        customerName,
        customerEmail,
        amount: grandTotal,
      },
      mergedPdfUrl: uploadResponse.secure_url,
      AIuseCount: 0,
      couponAttached: invoiceData.addCoupon && couponData
        ? {
            couponCode: dbCouponCode,
            couponDescription: couponData.description.trim(),
            couponExpiryDate: expiryDate,
            isCouponUsed: false,
          }
        : null,
    });

    await newInvoice.save();

    // Increment daily upload count
    const uploadCountResult = await incrementDailyUploadCount(owner);

    return successResponse("Invoice created successfully", {
      url: uploadResponse.secure_url,
      customerName: customerName,
      customerEmail: customerEmail,
      customerAmount: grandTotal,
      invoiceNumber: invoiceNumber,
      feedbackUrl: qrData,
      dailyUploadCount: uploadCountResult.dailyUploadCount,
      dailyLimit: uploadCountResult.dailyLimit,
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return errorResponse("Failed to create invoice");
  }
}

