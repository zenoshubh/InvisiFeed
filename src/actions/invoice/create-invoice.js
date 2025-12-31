"use server";

import dbConnect from "@/lib/db-connect";
import crypto from "crypto";
import { generateInvoicePdf } from "@/utils/pdf";
import InvoiceModel from "@/models/invoice";
import CouponModel from "@/models/coupon";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { getAuthenticatedBusinessDocument } from "@/lib/auth/session-utils";
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
      // Transform coupon data from form structure to validation schema structure
      // Form sends: { code, description, expiryDays: string }
      // Schema expects: { couponCode, description, expiryDays: number }
      const transformedCouponData = {
        couponCode: couponData.code || couponData.couponCode,
        description: couponData.description,
        expiryDays: typeof couponData.expiryDays === 'string' 
          ? parseInt(couponData.expiryDays, 10) 
          : couponData.expiryDays,
      };
      
      const couponValidation = validateCouponData(transformedCouponData);
      if (!couponValidation.success) {
        return errorResponse(`Invalid coupon data: ${couponValidation.message}`);
      }
      couponData = couponValidation.data;
    }

    // Get authenticated business
    const businessResult = await getAuthenticatedBusinessDocument();
    if (!businessResult.success) {
      return errorResponse(businessResult.message);
    }
    const { business, username } = businessResult;

    // Check daily upload limit
    const limitCheck = await checkDailyUploadLimit(business);
    if (!limitCheck.success) {
      return errorResponse(limitCheck.message, {
        timeLeft: limitCheck.timeLeft,
      });
    }

    // Generate invoice number if not provided
    const invoiceNumber =
      invoiceData.invoiceNumber.trim() || `INV-${Date.now()}`;

    // Check if invoice number already exists (read-only check)
    const existedInvoice = await InvoiceModel.findOne({
      invoiceId: invoiceNumber,
      business: business._id,
    })
      .select("_id")
      .lean();

    if (existedInvoice) {
      return errorResponse("Invoice number already exists");
    }

    // Generate QR code
    const encodedUsername = encodeURIComponent(username);
    const encodedInvoiceNumber = encodeURIComponent(invoiceNumber);
    let qrData = `${process.env.NEXT_PUBLIC_APP_URL}/feedback/${encodedUsername}?invoiceNo=${encodedInvoiceNumber}`;

    // Create coupon document if coupon data is provided
    let couponId = null;
    let modifiedCouponCodeforURL = null;
    
    if (invoiceData.addCoupon && couponData) {
      // Generate coupon code for database - use estimatedDocumentCount for approximate count
      const invoiceCount = await InvoiceModel.estimatedDocumentCount();
      const dbCouponCode = `${couponData.couponCode.trim()}${invoiceCount + 1}`;
      
      // Generate 4 random characters for URL
      const randomChars = Array.from(
        { length: 4 },
        () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[crypto.randomInt(0, 36)]
      ).join("");
      
      modifiedCouponCodeforURL = `${randomChars}${couponData.couponCode.trim()}${invoiceCount + 1}`;
      
      // Calculate expiry date
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + Number(couponData.expiryDays));

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
      business: business._id,
      customerDetails: {
        customerName,
        customerEmail,
        amount: grandTotal,
      },
      mergedPdfUrl: uploadResponse.secure_url,
      AIuseCount: 0,
      coupon: couponId, // Use Coupon ObjectId instead of couponAttached
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

    return successResponse("Invoice created successfully", {
      pdfUrl: uploadResponse.secure_url,
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

