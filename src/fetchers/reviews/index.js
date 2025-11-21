"use server";

import dbConnect from "@/lib/db-connect";
import InvisifeedReviewModel from "@/models/invisifeed-review";
import { successResponse, errorResponse } from "@/utils/response";

export async function getReviews() {
  try {
    await dbConnect();
    const reviews = await InvisifeedReviewModel.find().lean();
    return successResponse("Reviews fetched successfully", {
      reviews,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return errorResponse("Failed to fetch reviews");
  }
}

