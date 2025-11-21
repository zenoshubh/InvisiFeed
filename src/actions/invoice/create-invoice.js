"use server";

import OwnerModel from "@/models/owner";
import dbConnect from "@/lib/db-connect";
import crypto from "crypto";
import { generateInvoicePdf } from "@/utils/pdf-generator";
import InvoiceModel from "@/models/invoice";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { uploadToCloudinary } from "@/lib/cloudinary";

function validateCouponData(couponData) {
  if (!couponData) return null;

  couponData = JSON.parse(couponData);
  // Required fields validation
  if (!couponData.code || typeof couponData.code !== "string") {
    throw new Error("Invalid coupon code ");
  }
  if (couponData.code.includes(" ")) {
    throw new Error("Coupon code must not contain spaces");
  }
  if (!couponData.description || typeof couponData.description !== "string") {
    throw new Error("Invalid coupon description ");
  }

  // Length validations
  if (couponData.code.length < 3 || couponData.code.length > 10) {
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
  if (!/^[A-Z0-9]+$/.test(couponData.code)) {
    throw new Error(
      "Coupon code must contain only uppercase letters and numbers"
    );
  }

  return true;
}

export async function createInvoice(invoiceData) {
  try {
    await dbConnect();

    const { customerName, customerEmail } = invoiceData;

    let couponData = invoiceData.coupon;

    if (invoiceData.addCoupon) {
      try {
        couponData = JSON.stringify(couponData);
        // Validate coupon data against schema
        validateCouponData(couponData);
      } catch (error) {
        console.error(error);
        return {
          success: false,
          message: `Invalid coupon data: ${error.message}`,
        };
      }
    }

    const session = await getServerSession(authOptions);
    const username = session?.user?.username;

    if (!username) {
      return { success: false, message: "Unauthorized" };
    }

    // Find owner
    const owner = await OwnerModel.findOne({ username });
    if (!owner) {
      return { success: false, message: "Business not found" };
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

    const isProPlan =
      owner?.plan?.planName === "pro" && owner?.plan?.planEndDate > new Date();

    if (isProPlan) {
      if (owner.uploadedInvoiceCount.dailyUploadCount >= 10) {
        return {
          success: false,
          message: `Daily upload limit reached. Please try again after ${hoursLeft} hours.`,
          data: {
            timeLeft: hoursLeft,
          },
        };
      }
    }

    // Check if daily limit reached for free plan and pro-trial plan
    if (!isProPlan) {
      if (owner.uploadedInvoiceCount.dailyUploadCount >= 3) {
        return {
          success: false,
          message: `Daily upload limit reached. Please try again after ${hoursLeft} hours. Upgrade to pro plan to increase daily upload limit`,
          data: {
            timeLeft: hoursLeft,
          },
        };
      }
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
      return { success: false, message: "Invoice number already exists" };
    }

    // Generate QR code
    const encodedUsername = encodeURIComponent(username);
    const encodedInvoiceNumber = encodeURIComponent(invoiceNumber);
    let qrData = `${process.env.NEXT_PUBLIC_APP_URL}/feedback/${encodedUsername}?invoiceNo=${encodedInvoiceNumber}`;

    // Add coupon data if provided
    let modifiedCouponCodeforURL = null;
    let dbCouponCode = null;
    const expiryDate = new Date();
    if (invoiceData.addCoupon && invoiceData.coupon) {
      // Generate 4 random characters
      const randomChars = Array.from(
        { length: 4 },
        () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[crypto.randomInt(0, 36)]
      ).join("");

      // Modify coupon code by adding random chars at start and invoice count
      dbCouponCode = `${invoiceData.coupon.code.trim()}${
        (await InvoiceModel.countDocuments({})) + 1
      }`;
      modifiedCouponCodeforURL = `${randomChars}${invoiceData.coupon.code.trim()}${
        (await InvoiceModel.countDocuments({})) + 1
      }`;
      expiryDate.setDate(
        expiryDate.getDate() + Number(invoiceData.coupon.expiryDays)
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
      couponAttached: invoiceData.addCoupon
        ? {
            couponCode: dbCouponCode,
            couponDescription: invoiceData.coupon.description.trim(),
            couponExpiryDate: expiryDate,
            isCouponUsed: false,
          }
        : null,
    });

    await newInvoice.save();

    // Update upload counts
    owner.uploadedInvoiceCount.dailyUploadCount += 1;

    await owner.save();

    return {
      success: true,
      message: "Invoice created successfully",
      data: {
        url: uploadResponse.secure_url,
        customerName: customerName,
        customerEmail: customerEmail,
        customerAmount: grandTotal,
        invoiceNumber: invoiceNumber,
        feedbackUrl: qrData,
        dailyUploadCount: owner.uploadedInvoiceCount.dailyUploadCount,
        timeLeft: hoursLeft,
      },
    };
  } catch (error) {
    console.error("Error creating invoice:", error);
    return { success: false, message: "Failed to create invoice" };
  }
}

