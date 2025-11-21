"use server";

import dbConnect from "@/lib/db-connect";
import InvisifeedReviewModel from "@/models/invisifeed-review";
import { getAuthenticatedSession } from "@/lib/auth/session-utils";
import { successResponse, errorResponse } from "@/utils/response";

export async function submitReview(review) {
  await dbConnect();
  try {
    const sessionResult = await getAuthenticatedSession();
    if (!sessionResult.success) {
      return errorResponse(sessionResult.message);
    }

    if (!review) {
      return errorResponse("Missing review");
    }

    const newReview = new InvisifeedReviewModel({
      review,
    });

    await newReview.save();

    return successResponse("Review sent successfully");
  } catch (error) {
    console.error("Error adding review:", error);
    return errorResponse("Failed to add review");
  }
}

