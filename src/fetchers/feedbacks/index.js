"use server";

import dbConnect from "@/lib/db-connect";
import OwnerModel from "@/models/owner";
import FeedbackModel from "@/models/feedback";
import InvoiceModel from "@/models/invoice";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function getFeedbacks({
  page = 1,
  limit = 5,
  sortBy = "newest",
}) {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return { success: false, message: "Unauthorized" };
    }

    const username = session?.user?.username;

    const owner = await OwnerModel.findOne({ username });

    if (!owner) {
      return { success: false, message: "Business not found" };
    }

    // Get total count for pagination
    const totalFeedbacks = await FeedbackModel.countDocuments({
      givenTo: owner._id,
    });
    const totalPages = Math.ceil(totalFeedbacks / limit);
    const startIndex = (page - 1) * limit;

    // Build sort object
    let sortObject = {};
    switch (sortBy) {
      case "newest":
        sortObject = { createdAt: -1 };
        break;
      case "oldest":
        sortObject = { createdAt: 1 };
        break;
      case "highest":
        sortObject = { overAllRating: -1 };
        break;
      case "lowest":
        sortObject = { overAllRating: 1 };
        break;
      default:
        sortObject = { createdAt: -1 };
    }

    // Get paginated feedbacks with customer details
    const feedbacks = await FeedbackModel.find({ givenTo: owner._id })
      .sort(sortObject)
      .skip(startIndex)
      .limit(limit)
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

    return {
      success: true,
      message: "Feedbacks retrieved successfully",
      data: {
        feedbacks: feedbacksWithDetails,
        totalFeedbacks,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    return { success: false, message: error.message || "Failed to fetch feedbacks" };
  }
}

