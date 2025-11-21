import dbConnect from "@/lib/db-connect";
import FeedbackModel from "@/models/feedback";
import InvoiceModel from "@/models/invoice";
import OwnerModel from "@/models/owner";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";

// Constants
const METRICS = {
  satisfactionRating: "Satisfaction",
  communicationRating: "Communication",
  qualityOfServiceRating: "Quality of Service",
  valueForMoneyRating: "Value for Money",
  recommendRating: "Recommendation",
  overAllRating: "Overall Rating",
};

// Helper functions
const calculateAverageRatings = (feedbacks, totalFeedbacks) => {
  if (!totalFeedbacks)
    return Object.fromEntries(Object.keys(METRICS).map((key) => [key, 0]));

  return Object.fromEntries(
    Object.keys(METRICS).map((key) => [
      key,
      Number(
        (
          feedbacks.reduce((sum, feedback) => sum + (feedback[key] || 0), 0) /
          totalFeedbacks
        ).toFixed(2)
      ),
    ])
  );
};

const getTotalSales = (invoices) => {
  const totalSales = invoices.reduce(
    (sum, invoice) => sum + (invoice.customerDetails.amount || 0),
    0
  );

  if (!invoices || invoices.length === 0) {
 
    return 0;
  }

  return Number(totalSales.toFixed(2));
};

const getAverageRevisitFrequencyFromInvoices = async (invoices) => {
  if (!invoices || invoices.length === 0) {
   
    return 0;
  }

  // Group invoices by customerEmail
  const customerRevisitCounts = invoices.reduce((acc, invoice) => {
    const email = invoice.customerDetails?.customerEmail;
    if (email) {
      acc[email] = (acc[email] || 0) + 1; // Increment revisit count for each email
    }
    return acc;
  }, {});

  // Filter customers with revisitCount > 1
  const filteredCustomers = Object.values(customerRevisitCounts).filter(
    (count) => count > 1
  );

  if (filteredCustomers.length === 0) {
   
    return 0;
  }

  // Calculate average revisit frequency
  const averageRevisitFrequency =
    filteredCustomers.reduce((sum, count) => sum + count, 0) /
    (filteredCustomers.length || 1); // Avoid divide by zero


  return Number(averageRevisitFrequency.toFixed(1));
};

const getPerformanceMetrics = (averageRatings) => {
  const metricsArray = Object.entries(averageRatings)
    .filter(([key]) => key !== "overAllRating")
    .sort(([, a], [, b]) => b - a);

  return {
    best: {
      metric: METRICS[metricsArray[0][0]],
      rating: metricsArray[0][1],
    },
    worst: {
      metric: METRICS[metricsArray[metricsArray.length - 1][0]],
      rating: metricsArray[metricsArray.length - 1][1],
    },
  };
};

// Helper function to get current month feedbacks
function getCurrentMonthFeedbacks(feedbacks) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  return feedbacks.filter((feedback) => {
    const feedbackDate = new Date(feedback.createdAt);
    return (
      feedbackDate.getMonth() === currentMonth &&
      feedbackDate.getFullYear() === currentYear
    );
  });
}

// Helper function to group feedbacks by date for current month
function groupByDate(feedbacks) {
  const grouped = {};
  const currentDate = new Date();
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  // Initialize all days with zero ratings
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const dateKey = date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
    grouped[dateKey] = {
      date: dateKey,
      rating: 0,
      count: 0,
    };
  }

  // Add actual feedback data
  feedbacks.forEach((feedback) => {
    const feedbackDate = new Date(feedback.createdAt);
    const dateKey = feedbackDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });

    if (grouped[dateKey]) {
      grouped[dateKey].rating += feedback.overAllRating;
      grouped[dateKey].count += 1;
    }
  });

  // Calculate averages and sort by date
  const sortedData = Object.values(grouped)
    .map((day) => ({
      ...day,
      rating: day.count > 0 ? Number((day.rating / day.count).toFixed(2)) : 0,
    }))
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    });

  // If we have more than 6 points, group them into 6 intervals
  if (sortedData.length > 6) {
    const interval = Math.ceil(sortedData.length / 6);
    const groupedData = [];

    for (let i = 0; i < sortedData.length; i += interval) {
      const chunk = sortedData.slice(i, i + interval);
      const averageRating =
        chunk.reduce((sum, day) => sum + day.rating, 0) / chunk.length;
      const totalCount = chunk.reduce((sum, day) => sum + day.count, 0);

      groupedData.push({
        date: `${chunk[0].date} - ${chunk[chunk.length - 1].date}`,
        rating: Number(averageRating.toFixed(2)),
        count: totalCount,
      });
    }

    return groupedData;
  }

  return sortedData;
}

// Helper function to get current week feedbacks
function getCurrentWeekFeedbacks(feedbacks) {
  const currentDate = new Date();
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return feedbacks.filter((feedback) => {
    const feedbackDate = new Date(feedback.createdAt);
    return feedbackDate >= startOfWeek && feedbackDate <= endOfWeek;
  });
}

// Helper function to get current year feedbacks
function getCurrentYearFeedbacks(feedbacks) {
  const currentYear = new Date().getFullYear();
  return feedbacks.filter((feedback) => {
    const feedbackYear = new Date(feedback.createdAt).getFullYear();
    return feedbackYear === currentYear;
  });
}

// Helper function to group feedbacks by day
function groupByDay(feedbacks) {
  const grouped = {};
  feedbacks.forEach((feedback) => {
    const date = new Date(feedback.createdAt);
    const dayKey = date.toLocaleDateString("en-US", {
      weekday: "short",
    });

    if (!grouped[dayKey]) {
      grouped[dayKey] = {
        date: dayKey,
        rating: 0,
        count: 0,
      };
    }
    grouped[dayKey].rating += feedback.overAllRating;
    grouped[dayKey].count += 1;
  });

  // Sort days in chronological order
  const dayOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return Object.values(grouped)
    .map((day) => ({
      ...day,
      rating: Number((day.rating / day.count).toFixed(2)),
    }))
    .sort((a, b) => dayOrder.indexOf(a.date) - dayOrder.indexOf(b.date));
}

// Helper function to group feedbacks by month
function groupByMonth(feedbacks) {
  const grouped = {};
  const monthOrder = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Initialize all months with zero ratings
  monthOrder.forEach((month) => {
    grouped[month] = {
      date: month,
      rating: 0,
      count: 0,
    };
  });

  // Add actual feedback data
  feedbacks.forEach((feedback) => {
    const date = new Date(feedback.createdAt);
    const monthKey = date.toLocaleDateString("en-US", {
      month: "short",
    });

    if (grouped[monthKey]) {
      grouped[monthKey].rating += feedback.overAllRating;
      grouped[monthKey].count += 1;
    }
  });

  // Calculate averages and sort
  return Object.values(grouped)
    .map((month) => ({
      ...month,
      rating:
        month.count > 0 ? Number((month.rating / month.count).toFixed(2)) : 0,
    }))
    .sort((a, b) => monthOrder.indexOf(a.date) - monthOrder.indexOf(b.date));
}

const calculateAverageResponseTime = (invoiceWithFeedbackSubmitted) => {
  // Get all invoices (Array) with feedback submitted
  const responseTimeArray = invoiceWithFeedbackSubmitted.map((invoice) => {
    const feedbackSubmittedAt = new Date(invoice.feedbackSubmittedAt);
    const createdAt = new Date(invoice.createdAt);
    const timeDifference = feedbackSubmittedAt - createdAt;
    const timeDifferenceInHours = timeDifference / (1000 * 60 * 60);
    return Number(timeDifferenceInHours.toFixed(1)); // Convert to number
  });

  if (responseTimeArray.length === 0) {
    return 0;
  }

  // Calculate average response time
  const averageResponseTime =
    responseTimeArray.reduce((sum, time) => sum + time, 0) /
    responseTimeArray.length;

  return Number(averageResponseTime.toFixed(1));
};

// Helper function to group sales by date
function groupSalesByDate(invoices, viewType , salesYear) {
  const grouped = {};
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentDay = currentDate.getDate();

  // Filter invoices based on view type
  if (viewType === "currentWeek") {
    // Get start of current week (Sunday)
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Get end of current week (Saturday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Filter invoices for current week
    invoices = invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.createdAt);
      return invoiceDate >= startOfWeek && invoiceDate <= endOfWeek;
    });

    // Initialize days of current week
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateKey = date.toLocaleDateString("en-US", { weekday: "short" });
      grouped[dateKey] = { date: dateKey, sales: 0 };
    }
  } else if (viewType === "currentMonth") {

    const currentYear = currentDate.getFullYear();

    // Get start of current month
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Get end of current month
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    // Filter invoices for current month
    invoices = invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.createdAt);
      return invoiceDate >= startOfMonth && invoiceDate <= endOfMonth;
    });

    // Initialize days of current month
    const daysInMonth = endOfMonth.getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateKey = date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      });
      grouped[dateKey] = { date: dateKey, sales: 0 };
    }
  } else if (viewType === "currentYear") {
    // Get start of current year
    const startOfYear = new Date(salesYear, 0, 1);
    startOfYear.setHours(0, 0, 0, 0);

    // Get end of current year
    const endOfYear = new Date(salesYear, 11, 31);
    endOfYear.setHours(23, 59, 59, 999);

    // Filter invoices for current year
    invoices = invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.createdAt);
      return invoiceDate >= startOfYear && invoiceDate <= endOfYear;
    });

    // Initialize months of current year
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    months.forEach((month) => {
      grouped[month] = { date: month, sales: 0 };
    });
  }

  // Add actual sales data
  invoices.forEach((invoice) => {
    const invoiceDate = new Date(invoice.createdAt);
    let dateKey;

    if (viewType === "currentMonth") {
      dateKey = invoiceDate.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      });
    } else if (viewType === "currentWeek") {
      dateKey = invoiceDate.toLocaleDateString("en-US", { weekday: "short" });
    } else if (viewType === "currentYear") {
      dateKey = invoiceDate.toLocaleDateString("en-US", { month: "short" });
    }

    if (grouped[dateKey]) {
      grouped[dateKey].sales += invoice.customerDetails.amount || 0;
    }
  });

  // Convert to array and sort
  return Object.values(grouped).sort((a, b) => {
    if (viewType === "currentMonth" || viewType === "currentWeek") {
      return new Date(a.date) - new Date(b.date);
    } else {
      const monthOrder = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];
      return monthOrder.indexOf(a.date) - monthOrder.indexOf(b.date);
    }
  });
}

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
    const URLParams = req.nextUrl.searchParams;
    const salesYear = URLParams.get("salesYear");
    const salesViewType = URLParams.get("salesViewType");
    const ratingsYear = URLParams.get("ratingsYear");
    const ratingsViewType = URLParams.get("ratingsViewType");

    const owner = await OwnerModel.findOne({ username });

    if (!owner) {
      return NextResponse.json(
        { success: false, message: "Business not found" },
        { status: 404 }
      );
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
      
      if (salesViewType === "" && salesYear) {

        // Filter invoices for the selected year
        const filteredInvoices = invoices.filter((invoice) => {
          const invoiceYear = new Date(invoice.createdAt).getFullYear();
          return invoiceYear === parseInt(salesYear);
        });

        
        // Group by month for the selected year
        salesData = groupSalesByDate(filteredInvoices, "currentYear" , salesYear);

      } else if (salesViewType) {

        salesData = groupSalesByDate(invoices, salesViewType , salesYear);
      } else {

        
        // Default to current year if no selection
        const currentYear = new Date().getFullYear();
        const filteredInvoices = invoices.filter((invoice) => {
          const invoiceYear = new Date(invoice.createdAt).getFullYear();
          return invoiceYear === currentYear;
        });
        salesData = groupSalesByDate(filteredInvoices, "currentYear");
      }
    }

    // Get all invoices (Array) with feedback submitted
    const invoiceWithFeedbackSubmitted = await InvoiceModel.find({
      owner: owner._id,
      isFeedbackSubmitted: true,
    });

    const averageResponseTime = calculateAverageResponseTime(
      invoiceWithFeedbackSubmitted
    );

    const averageRevisitFrequency =
      await getAverageRevisitFrequencyFromInvoices(invoices);


    // Calculate metrics
    const feedbackRatio = Number(
      ((totalFeedbacks / totalInvoices) * 100 || 0).toFixed(2)
    );
    const averageRatings = calculateAverageRatings(feedbacks, totalFeedbacks);
    const { best: bestPerforming, worst: worstPerforming } =
      getPerformanceMetrics(averageRatings);

    // Calculate feedback sentiment
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

    // Get historical data based on ratings view type
    let historicalRatings = [];
    let filteredFeedbacks = [...feedbacks];

    if (isProPlan) {
      // Handle historical year data
      if (ratingsYear) {
        filteredFeedbacks = feedbacks.filter((feedback) => {
          const feedbackYear = new Date(feedback.createdAt).getFullYear();
          return feedbackYear === parseInt(ratingsYear);
        });
        historicalRatings = groupByMonth(filteredFeedbacks);
      } else if (ratingsViewType) {
        // Handle current time period data
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
            // Default to current year if no view type selected
            filteredFeedbacks = getCurrentYearFeedbacks(feedbacks);
            historicalRatings = groupByMonth(filteredFeedbacks);
        }
      } else {
        // If neither year nor view type is selected, default to current year
        filteredFeedbacks = getCurrentYearFeedbacks(feedbacks);
        historicalRatings = groupByMonth(filteredFeedbacks);
      }
    }

    // Get available years for the Sales dropdown
    let availableYearsForSales = []
    if(isProPlan){
       availableYearsForSales = [
        ...new Set(
          invoices.map((invoice) => new Date(invoice.createdAt).getFullYear())
        ),
      ].sort((a, b) => b - a);
    }

    // Get available years for the Feedbacks or Ratings dropdown
    let availableYearsForFeedbacks = []
    if(isProPlan){
       availableYearsForFeedbacks = [
        ...new Set(
          feedbacks.map((feedback) => new Date(feedback.createdAt).getFullYear())
        ),
      ].sort((a, b) => b - a);
    }
   

    return NextResponse.json(
      {
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
          historicalRatings : isProPlan ? historicalRatings : [],
          availableYearsForSales : isProPlan ? availableYearsForSales : [],
          availableYearsForFeedbacks : isProPlan ? availableYearsForFeedbacks : [],
          averageResponseTime,
          salesData : isProPlan ? salesData : [],
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error getting dashboard metrics:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
