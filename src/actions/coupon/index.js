"use server";

import InvoiceModel from "@/models/invoice";
import CouponModel from "@/models/coupon";
import dbConnect from "@/lib/db-connect";
import { getAuthenticatedBusiness } from "@/lib/auth/session-utils";
import { successResponse, errorResponse } from "@/utils/response";

export async function deleteCoupon(invoiceId) {
  await dbConnect();
  try {
    if (!invoiceId) {
      return errorResponse("Invoice ID is required");
    }

    const businessResult = await getAuthenticatedBusiness();
    if (!businessResult.success) {
      return errorResponse(businessResult.message);
    }
    const { business } = businessResult;

    // Find the invoice to get the coupon reference
    const invoice = await InvoiceModel.findOne({
      invoiceId: invoiceId,
      business: business._id,
    })
      .select("coupon")
      .lean();

    if (!invoice) {
      return errorResponse("Invoice not found");
    }

    // If invoice has a coupon reference, update the coupon document
    if (invoice.coupon) {
      // Check if coupon exists first with lean
      const couponCheck = await CouponModel.findById(invoice.coupon)
        .select('_id')
        .lean();
      
      if (!couponCheck) {
        return errorResponse("Coupon not found");
      }

      // Fetch coupon document for saving (needs document methods)
      const coupon = await CouponModel.findById(couponCheck._id);
      
      // Mark coupon as used and inactive
      coupon.isUsed = true;
      coupon.isActive = false;
      await coupon.save();

      return successResponse("Coupon marked as used successfully");
    }

    // If no coupon reference, check for legacy couponAttached (backward compatibility)
    const invoiceWithAttached = await InvoiceModel.findOne({
      invoiceId: invoiceId,
      business: business._id,
    });

    if (invoiceWithAttached?.couponAttached) {
      invoiceWithAttached.couponAttached.isCouponUsed = true;
      await invoiceWithAttached.save();
      return successResponse("Coupon marked as used successfully");
    }

    return errorResponse("Coupon not found for this invoice");
  } catch (error) {
    console.error("Error updating coupon status:", error);
    return errorResponse("Internal Server Error");
  }
}

