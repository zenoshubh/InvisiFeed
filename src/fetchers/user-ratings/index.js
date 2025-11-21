"use server";

import dbConnect from "@/lib/db-connect";
import FeedbackModel from "@/models/feedback";
import { getAuthenticatedOwner } from "@/lib/auth/session-utils";
import { successResponse, errorResponse } from "@/utils/response";

export async function getUserRatings() {
  await dbConnect();

  try {
    const ownerResult = await getAuthenticatedOwner();
    if (!ownerResult.success) {
      return errorResponse(ownerResult.message);
    }
    const { owner } = ownerResult;

    // Calculate average ratings from all feedbacks
    const feedbacks = await FeedbackModel.find({ givenTo: owner._id });
    const totalFeedbacks = feedbacks.length;

    if (totalFeedbacks === 0) {
      return successResponse("No feedbacks found for this business", {
        averageRatings: {
          satisfactionRating: 0,
          communicationRating: 0,
          qualityOfServiceRating: 0,
          valueForMoneyRating: 0,
          recommendRating: 0,
          overAllRating: 0,
        },
        totalFeedbacks: 0,
      });
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

    return successResponse("Owner ratings retrieved successfully", {
      averageRatings,
      totalFeedbacks,
    });
  } catch (error) {
    console.error("Error fetching user ratings:", error);
    return errorResponse(error.message || "Failed to fetch ratings");
  }
}

