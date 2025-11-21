"use server";

import dbConnect from "@/lib/db-connect";
import FeedbackModel from "@/models/feedback";
import InvoiceModel from "@/models/invoice";
import OwnerModel from "@/models/owner";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
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
} from "@/utils/dashboard-utility";

export async function getDashboardMetrics({
  salesYear,
  salesViewType,
  ratingsYear,
  ratingsViewType,
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

    const invoices = await InvoiceModel.find({ owner: owner._id });
    const totalSales = getTotalSales(invoices);
    const feedbacks = await FeedbackModel.find({ givenTo: owner._id });
    const totalFeedbacks = feedbacks.length;
    const totalInvoices = invoices.length;

    // Get sales data based on sales view type
    const isProPlan =
      (owner?.plan?.planName === "pro" ||
        owner?.plan?.planName === "pro-trial") &&
      owner?.plan?.planEndDate > new Date();

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

    const invoiceWithFeedbackSubmitted = await InvoiceModel.find({
      owner: owner._id,
      isFeedbackSubmitted: true,
    });

    const averageResponseTime = calculateAverageResponseTime(
      invoiceWithFeedbackSubmitted
    );

    const averageRevisitFrequency =
      await getAverageRevisitFrequencyFromInvoices(invoices);

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

    let availableYearsForSales = [];
    if (isProPlan) {
      availableYearsForSales = [
        ...new Set(
          invoices.map((invoice) => new Date(invoice.createdAt).getFullYear())
        ),
      ].sort((a, b) => b - a);
    }

    let availableYearsForFeedbacks = [];
    if (isProPlan) {
      availableYearsForFeedbacks = [
        ...new Set(
          feedbacks.map((feedback) =>
            new Date(feedback.createdAt).getFullYear()
          )
        ),
      ].sort((a, b) => b - a);
    }

    return {
      success: true,
      message: "Dashboard metrics retrieved successfully",
      data: {
        feedbackRatio,
        averageOverallRating: averageRatings.overAllRating,
        totalFeedbacks,
        totalInvoices,
        apiMetrics: METRICS,
        averageRevisitFrequency,
        totalSales,
        bestPerforming,
        worstPerforming,
        improvements: owner.currentRecommendedActions?.improvements || [],
        strengths: owner.currentRecommendedActions?.strengths || [],
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
      },
    };
  } catch (error) {
    console.error("Error getting dashboard metrics:", error);
    return { success: false, message: "Internal server error" };
  }
}
