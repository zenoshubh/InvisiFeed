"use server";

import dbConnect from "@/lib/db-connect";
import InvoiceModel from "@/models/invoice";
import FeedbackModel from "@/models/feedback";
import { getAuthenticatedOwner } from "@/lib/auth/session-utils";
import { getPaginationParams, buildSortObject, SORT_CONFIGS, buildPaginationResponse } from "@/utils/pagination";
import { successResponse, errorResponse } from "@/utils/response";

export async function getInvoices({
  page = 1,
  limit = 10,
  sortBy = "newest",
  feedbackFilter = "all",
  search = "",
}) {
  await dbConnect();

  try {
    const ownerResult = await getAuthenticatedOwner();
    if (!ownerResult.success) {
      return errorResponse(ownerResult.message);
    }
    const { owner } = ownerResult;

    // Build query
    let query = { owner: owner._id };

    // Apply search filter
    if (search) {
      query.invoiceId = { $regex: search, $options: "i" };
    }

    // Apply feedback filter
    if (feedbackFilter !== "all") {
      switch (feedbackFilter) {
        case "submitted":
          query.isFeedbackSubmitted = true;
          break;
        case "not-submitted":
          query.isFeedbackSubmitted = false;
          break;
        case "anonymous":
          query.isFeedbackSubmitted = true;
          break;
        case "non-anonymous":
          query.isFeedbackSubmitted = true;
          break;
      }
    }

    // Get paginated invoices
    const { skip, limit: limitNum } = getPaginationParams(page, limit);
    const sortObject = buildSortObject(sortBy, SORT_CONFIGS.invoices);
    
    const invoices = await InvoiceModel.find(query)
      .sort(sortObject)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get feedbacks for the invoices
    const feedbacks = await FeedbackModel.find({
      givenTo: owner._id,
      invoiceId: { $in: invoices.map((inv) => inv._id) },
    }).lean();

    // Create a map of invoice ID to feedback
    const feedbackMap = feedbacks.reduce((acc, feedback) => {
      if (feedback.invoiceId) {
        acc[feedback.invoiceId.toString()] = feedback;
      }
      return acc;
    }, {});

    // Combine invoice and feedback data
    let invoicesWithFeedback = invoices.map((invoice) => {
      const feedback = feedbackMap[invoice._id.toString()];
      return {
        ...invoice,
        feedback: feedback ? { ...feedback } : null,
      };
    });

    // Apply anonymous/non-anonymous filter after combining data
    if (feedbackFilter === "anonymous") {
      invoicesWithFeedback = invoicesWithFeedback.filter(
        (invoice) => invoice.isFeedbackSubmitted && invoice.feedback === null
      );
    } else if (feedbackFilter === "non-anonymous") {
      invoicesWithFeedback = invoicesWithFeedback.filter(
        (invoice) => invoice.isFeedbackSubmitted && invoice.feedback !== null
      );
    }

    // Get total count for pagination
    const totalInvoices = await InvoiceModel.countDocuments(query);

    return successResponse("Invoices retrieved successfully", {
      invoices: invoicesWithFeedback,
      ...buildPaginationResponse(invoicesWithFeedback, totalInvoices, page, limit),
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return errorResponse("Failed to fetch invoices");
  }
}

