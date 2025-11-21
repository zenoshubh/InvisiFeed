"use server";

import dbConnect from "@/lib/db-connect";
import InvoiceModel from "@/models/invoice";
import OwnerModel from "@/models/owner";
import FeedbackModel from "@/models/feedback";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function getInvoices({
  page = 1,
  limit = 10,
  sortBy = "newest",
  feedbackFilter = "all",
  search = "",
}) {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return { success: false, message: "Unauthorized" };
    }

    const username = session?.user?.username;

    // Find owner
    const owner = await OwnerModel.findOne({ username });
    if (!owner) {
      return { success: false, message: "Business not found" };
    }

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
    const invoices = await InvoiceModel.find(query)
      .sort(sortBy === "newest" ? { createdAt: -1 } : { createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
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
    const totalPages = Math.ceil(totalInvoices / limit);

    return {
      success: true,
      message: "Invoices retrieved successfully",
      data: {
        invoices: invoicesWithFeedback,
        totalInvoices,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return { success: false, message: "Failed to fetch invoices" };
  }
}

