import dbConnect from "@/lib/db-connect";
import FeedbackModel from "@/models/feedback";
import OwnerModel from "@/models/owner";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";


export async function GET(req) {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const username = session?.user?.username;

    const owner = await OwnerModel.findOne({ username });

    if (!owner) {
      return NextResponse.json(
        { success: false, message: "Business not found" },
        { status: 404 }
      );
    }

    // Calculate average ratings from all feedbacks
    const feedbacks = await FeedbackModel.find({ givenTo: owner._id });
    const totalFeedbacks = feedbacks.length;

    if (totalFeedbacks === 0) {
      return NextResponse.json(
        {
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
        },
        { status: 200 }
      );
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

    return NextResponse.json(
      {
        success: true,
        message: "Owner ratings retrieved successfully",
        data: {
          averageRatings,
          totalFeedbacks,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
