"use server";

import dbConnect from "@/lib/db-connect";
import FeedbackModel from "@/models/feedback";
import InvoiceModel from "@/models/invoice";
import { getAuthenticatedBusiness } from "@/lib/auth/session-utils";
import { checkIsProPlan } from "@/utils/invoice/upload-limit";
import { successResponse, errorResponse } from "@/utils/response";
import {
  METRICS,
  calculateAverageRatings,
  getTotalSales,
  getAverageRevisitFrequencyFromInvoices,
  getPerformanceMetrics,
  getCurrentMonthFeedbacks,
  groupByDate,
  getCurrentWeekFeedbacks,
  getCurrentYearFeedbacks,
  groupByDay,
  groupByMonth,
  calculateAverageResponseTime,
  groupSalesByDate,
} from "@/utils/dashboard";

export async function getDashboardMetrics({
  salesYear,
  salesViewType,
  ratingsYear,
  ratingsViewType,
}) {
  await dbConnect();
  try {
    const businessResult = await getAuthenticatedBusiness();
    if (!businessResult.success) {
      return errorResponse(businessResult.message);
    }
    const { business } = businessResult;

    // Use aggregation for counts (more efficient than loading all documents)
    const [invoiceStats, feedbackStats] = await Promise.all([
      InvoiceModel.aggregate([
        { $match: { business: business._id } },
        {
          $group: {
            _id: null,
            totalInvoices: { $sum: 1 },
            totalSales: {
              $sum: {
                $ifNull: ["$customerDetails.amount", 0],
              },
            },
          },
        },
      ]),
      FeedbackModel.aggregate([
        { $match: { givenTo: business._id } },
        {
          $group: {
            _id: null,
            totalFeedbacks: { $sum: 1 },
          },
        },
      ]),
    ]);

    const totalInvoices = invoiceStats[0]?.totalInvoices || 0;
    const totalSales = invoiceStats[0]?.totalSales || 0;
    const totalFeedbacks = feedbackStats[0]?.totalFeedbacks || 0;

    // Load invoices and feedbacks only if needed for detailed calculations
    // For Pro plans, we need the full data for filtering/grouping
    const isProPlan = checkIsProPlan(business) || 
      (business?.plan?.planName === "pro-trial" && business?.plan?.planEndDate > new Date());

    let invoices = [];
    let feedbacks = [];

    if (isProPlan) {
      // Load full data only for Pro users (they get detailed analytics)
      [invoices, feedbacks] = await Promise.all([
        InvoiceModel.find({ business: business._id })
          .select("createdAt customerDetails")
          .lean(),
        FeedbackModel.find({ givenTo: business._id })
          .select("satisfactionRating communicationRating qualityOfServiceRating valueForMoneyRating recommendRating overAllRating createdAt")
          .lean(),
      ]);
    } else {
      // For free users, load minimal data needed for basic metrics
      feedbacks = await FeedbackModel.find({ givenTo: business._id })
        .select("satisfactionRating communicationRating qualityOfServiceRating valueForMoneyRating recommendRating overAllRating")
        .lean();
    }

    // Get sales data based on sales view type
    let salesData = [];

    if (isProPlan) {
      if (!salesViewType && salesYear) {
        const filteredInvoices = invoices.filter((invoice) => {
          const invoiceYear = new Date(invoice.createdAt).getFullYear();
          return invoiceYear === parseInt(salesYear);
        });
        salesData = groupSalesByDate(
          filteredInvoices,
          "currentYear",
          salesYear
        );
      } else if (salesViewType) {
        salesData = groupSalesByDate(invoices, salesViewType, salesYear);
      } else {
        const currentYear = new Date().getFullYear();
        const filteredInvoices = invoices.filter((invoice) => {
          const invoiceYear = new Date(invoice.createdAt).getFullYear();
          return invoiceYear === currentYear;
        });
        salesData = groupSalesByDate(filteredInvoices, "currentYear");
      }
    }

    // Only load if needed for average response time calculation
    const invoiceWithFeedbackSubmitted = isProPlan
      ? await InvoiceModel.find({
          business: business._id,
          isFeedbackSubmitted: true,
        })
          .select("sentAt feedbackSubmittedAt createdAt")
          .lean()
      : [];

    const averageResponseTime = calculateAverageResponseTime(
      invoiceWithFeedbackSubmitted
    );

    // Calculate average revisit frequency only if we have invoice data
    const averageRevisitFrequency = isProPlan
      ? await getAverageRevisitFrequencyFromInvoices(invoices)
      : 0;

    const feedbackRatio = Number(
      ((totalFeedbacks / totalInvoices) * 100 || 0).toFixed(2)
    );
    const averageRatings = calculateAverageRatings(feedbacks, totalFeedbacks);
    const { best: bestPerforming, worst: worstPerforming } =
      getPerformanceMetrics(averageRatings);

    const positiveFeedbacks = feedbacks.filter(
      (f) => f.overAllRating > 2.5
    ).length;
    const negativeFeedbacks = totalFeedbacks - positiveFeedbacks;
    const positivePercentage = Number(
      ((positiveFeedbacks / totalFeedbacks) * 100 || 0).toFixed(2)
    );
    const negativePercentage = Number(
      ((negativeFeedbacks / totalFeedbacks) * 100 || 0).toFixed(2)
    );

    let historicalRatings = [];
    let filteredFeedbacks = [...feedbacks];

    if (isProPlan) {
      if (ratingsYear) {
        filteredFeedbacks = feedbacks.filter((feedback) => {
          const feedbackYear = new Date(feedback.createdAt).getFullYear();
          return feedbackYear === parseInt(ratingsYear);
        });
        historicalRatings = groupByMonth(filteredFeedbacks);
      } else if (ratingsViewType) {
        switch (ratingsViewType) {
          case "currentMonth":
            filteredFeedbacks = getCurrentMonthFeedbacks(feedbacks);
            historicalRatings = groupByDate(filteredFeedbacks);
            break;
          case "currentWeek":
            filteredFeedbacks = getCurrentWeekFeedbacks(feedbacks);
            historicalRatings = groupByDay(filteredFeedbacks);
            break;
          case "currentYear":
            filteredFeedbacks = getCurrentYearFeedbacks(feedbacks);
            historicalRatings = groupByMonth(filteredFeedbacks);
            break;
          default:
            filteredFeedbacks = getCurrentYearFeedbacks(feedbacks);
            historicalRatings = groupByMonth(filteredFeedbacks);
        }
      } else {
        filteredFeedbacks = getCurrentYearFeedbacks(feedbacks);
        historicalRatings = groupByMonth(filteredFeedbacks);
      }
    }

    // Use aggregation for available years (more efficient)
    let availableYearsForSales = [];
    let availableYearsForFeedbacks = [];

    if (isProPlan && totalInvoices > 0) {
      const salesYearsResult = await InvoiceModel.aggregate([
        { $match: { business: business._id } },
        {
          $group: {
            _id: { $year: "$createdAt" },
          },
        },
        { $sort: { _id: -1 } },
      ]);
      availableYearsForSales = salesYearsResult.map((r) => r._id);
    }

    if (isProPlan && totalFeedbacks > 0) {
      const feedbackYearsResult = await FeedbackModel.aggregate([
        { $match: { givenTo: business._id } },
        {
          $group: {
            _id: { $year: "$createdAt" },
          },
        },
        { $sort: { _id: -1 } },
      ]);
      availableYearsForFeedbacks = feedbackYearsResult.map((r) => r._id);
    }

    return successResponse("Dashboard metrics retrieved successfully", {
        feedbackRatio,
        averageOverallRating: averageRatings.overAllRating,
        totalFeedbacks,
        totalInvoices,
        apiMetrics: METRICS,
        averageRevisitFrequency,
        totalSales,
        bestPerforming,
        worstPerforming,
        improvements: [], // Will be populated from RecommendedAction model
        strengths: [], // Will be populated from RecommendedAction model
        positivePercentage,
        positiveFeedbacks,
        negativeFeedbacks,
        averageRatings,
        negativePercentage,
        historicalRatings: isProPlan ? historicalRatings : [],
        availableYearsForSales: isProPlan ? availableYearsForSales : [],
        availableYearsForFeedbacks: isProPlan ? availableYearsForFeedbacks : [],
        averageResponseTime,
        salesData: isProPlan ? salesData : [],
      });
  } catch (error) {
    console.error("Error getting dashboard metrics:", error);
    return errorResponse("Internal server error");
  }
}
