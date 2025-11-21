"use server";

import InvoiceModel from "@/models/invoice";
import dbConnect from "@/lib/db-connect";
import { getAuthenticatedOwner } from "@/lib/auth/session-utils";
import { successResponse, errorResponse } from "@/utils/response";

export async function getCoupons() {
  await dbConnect();
  try {
    const ownerResult = await getAuthenticatedOwner();
    if (!ownerResult.success) {
      return errorResponse(ownerResult.message);
    }
    const { owner } = ownerResult;

    const invoices = await InvoiceModel.find({ owner: owner._id });

    // Extract all coupons from invoices
    const coupons = invoices
      .filter(
        (invoice) =>
          invoice?.couponAttached?.isCouponUsed === false &&
          invoice?.couponAttached?.couponExpiryDate > Date.now()
      ) // Only get invoices with coupons
      .map((invoice) => ({
        invoiceId: invoice.invoiceId,
        couponCode: invoice.couponAttached.couponCode,
        description: invoice.couponAttached.couponDescription,
        expiryDate: invoice.couponAttached.couponExpiryDate,
        isUsed: invoice.couponAttached.isCouponUsed,
      }));

    return successResponse("Coupons fetched successfully", {
      coupons,
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return errorResponse("Internal Server Error");
  }
}

