"use server";

import dbConnect from "@/lib/db-connect";
import FeedbackModel from "@/models/feedback";
import InvoiceModel from "@/models/invoice";
import { getAuthenticatedOwner } from "@/lib/auth/session-utils";
import { getPaginationParams, buildSortObject, SORT_CONFIGS, buildPaginationResponse } from "@/utils/pagination";
import { successResponse, errorResponse } from "@/utils/response";

export async function getFeedbacks({
  page = 1,
  limit = 5,
  sortBy = "newest",
}) {
  await dbConnect();

  try {
    const ownerResult = await getAuthenticatedOwner();
    if (!ownerResult.success) {
      return errorResponse(ownerResult.message);
    }
    const { owner } = ownerResult;

    // Get total count for pagination
    const totalFeedbacks = await FeedbackModel.countDocuments({
      givenTo: owner._id,
    });

    // Get pagination params and sort object
    const { skip, limit: limitNum } = getPaginationParams(page, limit);
    const sortObject = buildSortObject(sortBy, SORT_CONFIGS.feedbacks);

    // Get paginated feedbacks with customer details
    const feedbacks = await FeedbackModel.find({ givenTo: owner._id })
      .sort(sortObject)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Populate customer details for each feedback
    const feedbacksWithDetails = await Promise.all(
      feedbacks.map(async (feedback) => {
        if (feedback.invoiceId) {
          const invoice = await InvoiceModel.findById(feedback.invoiceId).select(
            "customerDetails"
          );
          if (invoice && invoice.customerDetails) {
            return {
              ...feedback,
              customerDetails: {
                customerName:
                  invoice.customerDetails.customerName || "Not Available",
                customerEmail:
                  invoice.customerDetails.customerEmail || "Not Available",
                amount: invoice.customerDetails.amount || null,
              },
            };
          }
        }
        return {
          ...feedback,
          customerDetails: {
            customerName: "Not Available",
            customerEmail: "Not Available",
            amount: null,
          },
        };
      })
    );

    return successResponse("Feedbacks retrieved successfully", {
      feedbacks: feedbacksWithDetails,
      ...buildPaginationResponse(feedbacksWithDetails, totalFeedbacks, page, limit),
    });
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    return errorResponse(error.message || "Failed to fetch feedbacks");
  }
}

