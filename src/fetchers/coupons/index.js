"use server";

import InvoiceModel from "@/models/invoice";
import CouponModel from "@/models/coupon";
import dbConnect from "@/lib/db-connect";
import { getAuthenticatedBusiness } from "@/lib/auth/session-utils";
import { successResponse, errorResponse } from "@/utils/response";
import { getPaginationParams, buildPaginationResponse } from "@/utils/pagination";

export async function getCoupons({ page = 1, limit = 100 } = {}) {
  await dbConnect();
  try {
    const businessResult = await getAuthenticatedBusiness();
    if (!businessResult.success) {
      return errorResponse(businessResult.message);
    }
    const { business } = businessResult;

    // Build query for coupons
    const query = { business: business._id };

    // Get total count for pagination
    const totalCoupons = await CouponModel.countDocuments(query);

    // Get pagination params
    const { skip, limit: limitNum } = getPaginationParams(page, limit);

    // Get paginated coupons for the business (not just active/not-used ones)
    // This allows users to see and manage all their coupons
    const coupons = await CouponModel.find(query)
      .select('_id business invoice couponCode description expiryDate isUsed isActive createdAt')
      .populate("invoice", "invoiceId")
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Format coupons for response and serialize for client component
    const formattedCoupons = coupons.map((coupon) => ({
      _id: coupon._id.toString(),
      invoiceId: coupon.invoice?.invoiceId || null,
      couponCode: coupon.couponCode,
      description: coupon.description,
      expiryDate: coupon.expiryDate 
        ? new Date(coupon.expiryDate).toISOString() 
        : null,
      isUsed: coupon.isUsed || false,
      isActive: coupon.isActive !== undefined ? coupon.isActive : true,
      createdAt: coupon.createdAt 
        ? new Date(coupon.createdAt).toISOString() 
        : null,
    }));

    return successResponse("Coupons fetched successfully", {
      coupons: formattedCoupons,
      ...buildPaginationResponse(formattedCoupons, totalCoupons, page, limit),
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return errorResponse("Internal Server Error");
  }
}

