import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import InvoiceModel from "@/models/invoice";
import OwnerModel from "@/models/owner";
import FeedbackModel from "@/models/feedback";
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
    const searchParams = req.nextUrl.searchParams;
    
    // Pagination parameters
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    
    // Sorting parameters
    const sortBy = searchParams.get("sortBy") || "newest";
    
    // Filter parameters
    const feedbackFilter = searchParams.get("feedbackFilter") || "all";
    const searchQuery = searchParams.get("search") || "";
    
    // Find owner
    const owner = await OwnerModel.findOne({ username });
    if (!owner) {
      return NextResponse.json(
        { success: false, message: "Business not found" },
        { status: 404 }
      );
    }

    // Build query
    let query = { owner: owner._id };
    
    // Apply search filter
    if (searchQuery) {
      query.invoiceId = { $regex: searchQuery, $options: "i" };
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
      invoiceId: { $in: invoices.map(inv => inv._id) }
    }).lean();

    // Create a map of invoice ID to feedback
    const feedbackMap = feedbacks.reduce((acc, feedback) => {
      if (feedback.invoiceId) {
        acc[feedback.invoiceId.toString()] = feedback;
      }
      return acc;
    }, {});

    // Combine invoice and feedback data
    let invoicesWithFeedback = invoices.map(invoice => {
      const feedback = feedbackMap[invoice._id.toString()];
      return {
        ...invoice,
        feedback: feedback ? {
          ...feedback,
        } : null
      };
    });

    // Apply anonymous/non-anonymous filter after combining data
    if (feedbackFilter === "anonymous") {
      invoicesWithFeedback = invoicesWithFeedback.filter(
        invoice => invoice.isFeedbackSubmitted && invoice.feedback === null
      );
    } else if (feedbackFilter === "non-anonymous") {
      invoicesWithFeedback = invoicesWithFeedback.filter(
        invoice => invoice.isFeedbackSubmitted && invoice.feedback !== null
      );
    }

    // Get total count for pagination
    const totalInvoices = await InvoiceModel.countDocuments(query);
    const totalPages = Math.ceil(totalInvoices / limit);

    return NextResponse.json({
      success: true,
      data: {
        invoices: invoicesWithFeedback,
        totalInvoices,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}
