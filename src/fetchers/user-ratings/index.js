"use server";

import dbConnect from "@/lib/db-connect";
import FeedbackModel from "@/models/feedback";
import OwnerModel from "@/models/owner";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function getUserRatings() {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return { success: false, message: "Unauthorized" };
    }

    const username = session?.user?.username;

    const owner = await OwnerModel.findOne({ username });

    if (!owner) {
      return { success: false, message: "Business not found" };
    }

    // Calculate average ratings from all feedbacks
    const feedbacks = await FeedbackModel.find({ givenTo: owner._id });
    const totalFeedbacks = feedbacks.length;

    if (totalFeedbacks === 0) {
      return {
        success: true,
        message: "No feedbacks found for this business",
        data: {
          averageRatings: {
            satisfactionRating: 0,
            communicationRating: 0,
            qualityOfServiceRating: 0,
            valueForMoneyRating: 0,
            recommendRating: 0,
            overAllRating: 0,
          },
          totalFeedbacks: 0,
        },
      };
    }

    const averageRatings = {
      satisfactionRating: 0,
      communicationRating: 0,
      qualityOfServiceRating: 0,
      valueForMoneyRating: 0,
      recommendRating: 0,
      overAllRating: 0,
    };

    // Sum up all ratings
    feedbacks.forEach((feedback) => {
      averageRatings.satisfactionRating += feedback.satisfactionRating;
      averageRatings.communicationRating += feedback.communicationRating;
      averageRatings.qualityOfServiceRating += feedback.qualityOfServiceRating;
      averageRatings.valueForMoneyRating += feedback.valueForMoneyRating;
      averageRatings.recommendRating += feedback.recommendRating;
      averageRatings.overAllRating += feedback.overAllRating;
    });

    // Calculate averages
    Object.keys(averageRatings).forEach((key) => {
      averageRatings[key] = Number(
        (averageRatings[key] / totalFeedbacks).toFixed(2)
      );
    });

    return {
      success: true,
      message: "Owner ratings retrieved successfully",
      data: {
        averageRatings,
        totalFeedbacks,
      },
    };
  } catch (error) {
    console.error("Error fetching user ratings:", error);
    return { success: false, message: error.message || "Failed to fetch ratings" };
  }
}

