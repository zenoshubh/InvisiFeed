"use server";

import dbConnect from "@/lib/db-connect";
import FeedbackModel from "@/models/feedback";
import InvoiceModel from "@/models/invoice";
import AccountModel from "@/models/account";
import BusinessModel from "@/models/business";
import RecommendedActionModel from "@/models/recommended-action";
import { getGenerativeModel } from "@/lib/google-ai";

export async function setRecommendedActions(username, invoiceNumber) {
  await dbConnect();

  try {
    // Find account by username - only fetch _id
    const account = await AccountModel.findOne({ username })
      .select('_id')
      .lean();

    if (!account) {
      return { success: false, message: "Account not found" };
    }

    // Find business by account - only fetch _id
    const business = await BusinessModel.findOne({
      account: account._id,
    })
      .select('_id')
      .lean();

    if (!business) {
      return { success: false, message: "Business not found" };
    }

    const invoice = await InvoiceModel.findOne({
      invoiceId: invoiceNumber,
      business: business._id,
    })
      .select('_id isFeedbackSubmitted updatedRecommendedActions')
      .lean();

    if (!invoice) {
      return { success: false, message: "Invoice not found" };
    }

    if (invoice.isFeedbackSubmitted && invoice.updatedRecommendedActions) {
      return {
        success: false,
        message: "Recommended actions already updated",
      };
    }

    // Use aggregation pipeline to calculate averages (much faster than loading all)
    const averageRatingsResult = await FeedbackModel.aggregate([
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

    const totalNumberOfFeedbacks =
      averageRatingsResult[0]?.totalFeedbacks || 0;

    const averageRatings = totalNumberOfFeedbacks > 0
      ? {
          satisfactionRating: averageRatingsResult[0].satisfactionRating || 0,
          communicationRating: averageRatingsResult[0].communicationRating || 0,
          qualityOfServiceRating: averageRatingsResult[0].qualityOfServiceRating || 0,
          valueForMoneyRating: averageRatingsResult[0].valueForMoneyRating || 0,
          recommendRating: averageRatingsResult[0].recommendRating || 0,
          overAllRating: averageRatingsResult[0].overAllRating || 0,
        }
      : {
          satisfactionRating: 0,
          communicationRating: 0,
          qualityOfServiceRating: 0,
          valueForMoneyRating: 0,
          recommendRating: 0,
          overAllRating: 0,
        };

    const model = getGenerativeModel("gemini-2.0-flash");

    const ratingsPrompt = `
      Satisfaction: ${averageRatings.satisfactionRating}/5,
      Communication: ${averageRatings.communicationRating}/5,
      Quality of Service: ${averageRatings.qualityOfServiceRating}/5,
      Value for Money: ${averageRatings.valueForMoneyRating}/5,
      Recommendation: ${averageRatings.recommendRating}/5,
      Overall Rating: ${averageRatings.overAllRating}/5
    `;

    // Generate improvement suggestions
    const improvementsPrompt = `${ratingsPrompt}\n\nBased on these ratings, provide exactly 3 specific, actionable improvement points. Each point should be a single line without any special characters or formatting. Focus on areas with lower ratings. Keep each point concise and practical. Do not include any introduction, preamble, or additional text—just 3 specific points.`;
    const improvementsResult = await model.generateContent(improvementsPrompt);
    const improvements = improvementsResult.response
      .text()
      .split("\n")
      .filter((point) => point.trim())
      .map((point) => point.replace(/[*#\-•]/g, "").trim())
      .slice(0, 3);

    // Generate strengths
    const strengthsPrompt = `${ratingsPrompt}\n\nBased on these ratings, provide exactly 3 key strengths. Each point should be a single line without any special characters or formatting. Focus on areas with higher ratings. Keep each point concise and impactful. Do not include any introduction, preamble, or additional text—just 3 specific points.`;
    const strengthsResult = await model.generateContent(strengthsPrompt);
    const strengths = strengthsResult.response
      .text()
      .split("\n")
      .filter((point) => point.trim())
      .map((point) => point.replace(/[*#\-•]/g, "").trim())
      .slice(0, 3);

    // Deactivate old recommended actions
    await RecommendedActionModel.updateMany(
      { business: business._id, isActive: true },
      { isActive: false }
    );

    // Create new recommended action
    await RecommendedActionModel.create({
      business: business._id,
      invoice: invoice._id,
      improvements,
      strengths,
      isActive: true,
    });

    // Update invoice
    await InvoiceModel.findByIdAndUpdate(invoice._id, {
      updatedRecommendedActions: true,
    });

    return {
      success: true,
      message: "Recommended actions set successfully",
    };
  } catch (error) {
    console.error("Error setting recommended actions:", error);
    return { success: false, message: error.message || "Failed to set recommended actions" };
  }
}

