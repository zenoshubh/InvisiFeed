"use server";

import dbConnect from "@/lib/db-connect";
import FeedbackModel from "@/models/feedback";
import { getAuthenticatedBusiness } from "@/lib/auth/session-utils";
import { successResponse, errorResponse } from "@/utils/response";

export async function getUserRatings() {
  await dbConnect();

  try {
    const businessResult = await getAuthenticatedBusiness();
    if (!businessResult.success) {
      return errorResponse(businessResult.message);
    }
    const { business } = businessResult;

    // Use aggregation pipeline for efficient average calculation
    const ratingsResult = await FeedbackModel.aggregate([
      { $match: { givenTo: business._id } },
      {
        $group: {
          _id: null,
          satisfactionRating: { $avg: "$satisfactionRating" },
          communicationRating: { $avg: "$communicationRating" },
          qualityOfServiceRating: { $avg: "$qualityOfServiceRating" },
          valueForMoneyRating: { $avg: "$valueForMoneyRating" },
          recommendRating: { $avg: "$recommendRating" },
          overAllRating: { $avg: "$overAllRating" },
          totalFeedbacks: { $sum: 1 },
        },
      },
    ]);

    const totalFeedbacks = ratingsResult[0]?.totalFeedbacks || 0;

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
      satisfactionRating: Number(
        (ratingsResult[0].satisfactionRating || 0).toFixed(2)
      ),
      communicationRating: Number(
        (ratingsResult[0].communicationRating || 0).toFixed(2)
      ),
      qualityOfServiceRating: Number(
        (ratingsResult[0].qualityOfServiceRating || 0).toFixed(2)
      ),
      valueForMoneyRating: Number(
        (ratingsResult[0].valueForMoneyRating || 0).toFixed(2)
      ),
      recommendRating: Number(
        (ratingsResult[0].recommendRating || 0).toFixed(2)
      ),
      overAllRating: Number(
        (ratingsResult[0].overAllRating || 0).toFixed(2)
      ),
    };

    return successResponse("Business ratings retrieved successfully", {
      averageRatings,
      totalFeedbacks,
    });
  } catch (error) {
    console.error("Error fetching user ratings:", error);
    return errorResponse(error.message || "Failed to fetch ratings");
  }
}

