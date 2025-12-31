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
      // Use findOneAndUpdate for atomic operation (more efficient than find + save)
      // Use lean() since we only need to check existence, not use document methods
      const updatedCoupon = await CouponModel.findOneAndUpdate(
        { _id: invoice.coupon },
        { isUsed: true, isActive: false },
        { new: true }
      )
        .select('_id')
        .lean();

      if (!updatedCoupon) {
        return errorResponse("Coupon not found");
      }

      return successResponse("Coupon marked as used successfully");
    }

    // If no coupon reference, check for legacy couponAttached (backward compatibility)
    const invoiceWithAttached = await InvoiceModel.findOne({
      invoiceId: invoiceId,
      business: business._id,
    })
      .select('couponAttached');

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

