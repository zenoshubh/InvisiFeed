"use server";

import dbConnect from "@/lib/db-connect";
import InvisifeedReviewModel from "@/models/invisifeed-review";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function submitReview(review) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    const username = session?.user?.username;

    if (!username) {
      return { success: false, message: "Unauthorized" };
    }

    if (!review) {
      return { success: false, message: "Missing review" };
    }

    const newReview = new InvisifeedReviewModel({
      review,
    });

    await newReview.save();

    return { success: true, message: "Review sent successfully" };
  } catch (error) {
    console.error("Error adding review:", error);
    return { success: false, message: "Failed to add review" };
  }
}

