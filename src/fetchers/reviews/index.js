"use server";

import dbConnect from "@/lib/db-connect";
import PlatformReviewModel from "@/models/platform-review";
import { successResponse, errorResponse } from "@/utils/response";
import { getPaginationParams, buildPaginationResponse } from "@/utils/pagination";

export async function getReviews({ page = 1, limit = 10 } = {}) {
  try {
    await dbConnect();
    
    // Get pagination params
    const { skip, limit: limitNum } = getPaginationParams(page, limit);
    
    // Get total count for pagination
    const totalReviews = await PlatformReviewModel.countDocuments();
    
    // Fetch paginated review fields needed for display
    const reviews = await PlatformReviewModel.find()
      .select('_id reviewerName reviewerRole rating comment createdAt updatedAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();
      
    return successResponse("Reviews fetched successfully", {
      reviews,
      ...buildPaginationResponse(reviews, totalReviews, page, limit),
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return errorResponse("Failed to fetch reviews");
  }
}

