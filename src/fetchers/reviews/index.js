"use server";

import dbConnect from "@/lib/db-connect";
import InvisifeedReviewModel from "@/models/invisifeed-review";

export async function getReviews() {
  try {
    await dbConnect();
    const reviews = await InvisifeedReviewModel.find();
    return {
      success: true,
      message: "Reviews fetched successfully",
      data: {
        reviews,
      },
    };
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return { success: false, message: "Failed to fetch reviews" };
  }
}

