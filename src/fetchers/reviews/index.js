"use server";

import dbConnect from "@/lib/db-connect";
import PlatformReviewModel from "@/models/platform-review";
import { successResponse, errorResponse } from "@/utils/response";

export async function getReviews() {
  try {
    await dbConnect();
    // Fetch all review fields needed for display
    const reviews = await PlatformReviewModel.find()
      .select('_id reviewerName reviewerRole rating comment createdAt updatedAt')
      .lean();
    return successResponse("Reviews fetched successfully", {
      reviews,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return errorResponse("Failed to fetch reviews");
  }
}

