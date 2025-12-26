"use server";

import dbConnect from "@/lib/db-connect";
import PlatformReviewModel from "@/models/platform-review";
import { successResponse, errorResponse } from "@/utils/response";

export async function getReviews() {
  try {
    await dbConnect();
    const reviews = await PlatformReviewModel.find().lean();
    return successResponse("Reviews fetched successfully", {
      reviews,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return errorResponse("Failed to fetch reviews");
  }
}

