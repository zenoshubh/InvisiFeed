"use server";

import InvoiceModel from "@/models/invoice";
import dbConnect from "@/lib/db-connect";
import { getAuthenticatedOwner } from "@/lib/auth/session-utils";
import { successResponse, errorResponse } from "@/utils/response";

export async function deleteCoupon(invoiceId) {
  await dbConnect();
  try {
    if (!invoiceId) {
      return errorResponse("Invoice ID is required");
    }

    const ownerResult = await getAuthenticatedOwner();
    if (!ownerResult.success) {
      return errorResponse(ownerResult.message);
    }
    const { owner } = ownerResult;

    // Find the invoice and update its coupon status
    const invoice = await InvoiceModel.findOne({
      invoiceId: invoiceId,
      owner: owner._id,
    });
    if (!invoice || !invoice.couponAttached) {
      return errorResponse("Invoice or coupon not found");
    }

    invoice.couponAttached.isCouponUsed = true;
    await invoice.save();

    return successResponse("Coupon marked as used successfully");
  } catch (error) {
    console.error("Error updating coupon status:", error);
    return errorResponse("Internal Server Error");
  }
}

