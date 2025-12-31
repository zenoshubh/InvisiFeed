"use server";

import dbConnect from "@/lib/db-connect";
import FeedbackModel from "@/models/feedback";
import InvoiceModel from "@/models/invoice";
import { getAuthenticatedBusiness } from "@/lib/auth/session-utils";
import { getPaginationParams, buildSortObject, SORT_CONFIGS, buildPaginationResponse } from "@/utils/pagination";
import { successResponse, errorResponse } from "@/utils/response";

export async function getFeedbacks({
  page = 1,
  limit = 5,
  sortBy = "newest",
}) {
  await dbConnect();

  try {
    const businessResult = await getAuthenticatedBusiness();
    if (!businessResult.success) {
      return errorResponse(businessResult.message);
    }
    const { business } = businessResult;

    // Get total count for pagination
    const totalFeedbacks = await FeedbackModel.countDocuments({
      givenTo: business._id,
    });

    // Get pagination params and sort object
    const { skip, limit: limitNum } = getPaginationParams(page, limit);
    const sortObject = buildSortObject(sortBy, SORT_CONFIGS.feedbacks);

    // Get paginated feedbacks with customer details
    const feedbacks = await FeedbackModel.find({ givenTo: business._id })
      .sort(sortObject)
      .skip(skip)
      .limit(limitNum)
      .select("invoice satisfactionRating communicationRating qualityOfServiceRating valueForMoneyRating recommendRating overAllRating feedbackContent suggestionContent isAnonymous createdAt")
      .lean();

    // Batch fetch invoices for customer details (avoid N+1)
    const invoiceIds = feedbacks
      .map((f) => f.invoice)
      .filter((id) => id !== null && id !== undefined);

    const invoices = invoiceIds.length > 0
      ? await InvoiceModel.find({ _id: { $in: invoiceIds } })
          .select("customerDetails")
          .lean()
      : [];

    // Create map for O(1) lookup
    const invoiceMap = invoices.reduce((acc, invoice) => {
      acc[invoice._id.toString()] = invoice.customerDetails || null;
      return acc;
    }, {});

    // Map feedbacks with customer details and serialize for client component
    const feedbacksWithDetails = feedbacks.map((feedback) => {
      const customerDetails = feedback.invoice
        ? invoiceMap[feedback.invoice.toString()]
        : null;

      // Serialize feedback data (convert ObjectIds to strings, Dates to ISO strings)
      return {
        _id: feedback._id.toString(),
        invoice: feedback.invoice?.toString() || null,
        satisfactionRating: feedback.satisfactionRating || null,
        communicationRating: feedback.communicationRating || null,
        qualityOfServiceRating: feedback.qualityOfServiceRating || null,
        valueForMoneyRating: feedback.valueForMoneyRating || null,
        recommendRating: feedback.recommendRating || null,
        overAllRating: feedback.overAllRating || null,
        feedbackContent: feedback.feedbackContent || null,
        suggestionContent: feedback.suggestionContent || null,
        isAnonymous: feedback.isAnonymous || false,
        createdAt: feedback.createdAt 
          ? new Date(feedback.createdAt).toISOString() 
          : null,
        customerDetails: customerDetails
          ? {
              customerName: customerDetails.customerName || "Not Available",
              customerEmail: customerDetails.customerEmail || "Not Available",
              amount: customerDetails.amount || null,
            }
          : {
              customerName: "Not Available",
              customerEmail: "Not Available",
              amount: null,
            },
      };
    });

    return successResponse("Feedbacks retrieved successfully", {
      feedbacks: feedbacksWithDetails,
      ...buildPaginationResponse(feedbacksWithDetails, totalFeedbacks, page, limit),
    });
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    return errorResponse(error.message || "Failed to fetch feedbacks");
  }
}

