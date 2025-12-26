"use server";

import dbConnect from "@/lib/db-connect";
import InvoiceModel from "@/models/invoice";
import FeedbackModel from "@/models/feedback";
import { getAuthenticatedBusiness } from "@/lib/auth/session-utils";
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
    const businessResult = await getAuthenticatedBusiness();
    if (!businessResult.success) {
      return errorResponse(businessResult.message);
    }
    const { business } = businessResult;

    // Build query using business._id
    let query = { business: business._id };

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

    // Get feedbacks for the invoices (batch lookup with $in)
    const invoiceIds = invoices.map((inv) => inv._id);
    const feedbacks = invoiceIds.length > 0
      ? await FeedbackModel.find({
          givenTo: business._id,
          invoice: { $in: invoiceIds },
        })
          .select("invoice satisfactionRating communicationRating qualityOfServiceRating valueForMoneyRating recommendRating overAllRating feedbackContent suggestionContent isAnonymous createdAt")
          .lean()
      : [];

    // Create a map of invoice ID to feedback
    const feedbackMap = feedbacks.reduce((acc, feedback) => {
      if (feedback.invoice) {
        acc[feedback.invoice.toString()] = feedback;
      }
      return acc;
    }, {});

    // Combine invoice and feedback data and serialize for client component
    let invoicesWithFeedback = invoices.map((invoice) => {
      const feedback = feedbackMap[invoice._id.toString()];
      
      // Serialize invoice data (convert ObjectIds to strings, Dates to ISO strings)
      const serializedInvoice = {
        _id: invoice._id.toString(),
        invoiceId: invoice.invoiceId,
        business: invoice.business?.toString() || null,
        customer: invoice.customer?.toString() || null,
        customerDetails: invoice.customerDetails ? {
          customerName: invoice.customerDetails.customerName || null,
          customerEmail: invoice.customerDetails.customerEmail || null,
          amount: invoice.customerDetails.amount || null,
        } : null,
        coupon: invoice.coupon?.toString() || null,
        mergedPdfUrl: invoice.mergedPdfUrl || null,
        status: invoice.status || null,
        AIuseCount: invoice.AIuseCount || 0,
        isFeedbackSubmitted: invoice.isFeedbackSubmitted || false,
        feedbackSubmittedAt: invoice.feedbackSubmittedAt 
          ? new Date(invoice.feedbackSubmittedAt).toISOString() 
          : null,
        updatedRecommendedActions: invoice.updatedRecommendedActions || false,
        sentAt: invoice.sentAt 
          ? new Date(invoice.sentAt).toISOString() 
          : null,
        viewedAt: invoice.viewedAt 
          ? new Date(invoice.viewedAt).toISOString() 
          : null,
        createdAt: invoice.createdAt 
          ? new Date(invoice.createdAt).toISOString() 
          : null,
        updatedAt: invoice.updatedAt 
          ? new Date(invoice.updatedAt).toISOString() 
          : null,
      };
      
      // Serialize feedback data if it exists
      const serializedFeedback = feedback ? {
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
      } : null;
      
      return {
        ...serializedInvoice,
        feedback: serializedFeedback,
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

