"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { getDashboardMetrics } from "@/actions/dashboard-actions";
import { motion } from "motion/react";
import {
  Lightbulb,
  Star,
  Clock,
  Repeat,
  TrendingUpDown,
  Lock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import {
  Label,
  Pie,
  PieChart,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter } from "next/navigation";
import LoadingScreen from "../LoadingScreen";
import Link from "next/link";

// Constants
const CHART_CONFIG = {
  feedbackRatio: {
    label: "Feedback Ratio",
    color: "#EAB308",
  },
  remaining: {
    label: "Remaining",
    color: "#1F2937",
  },
  positive: {
    label: "Positive",
    color: "#22C55E",
  },
  negative: {
    label: "Negative",
    color: "#EF4444",
  },
  ratings: {
    label: "Rating",
    color: "#FACC15",
  },
  label: {
    color: "#FFFFFF",
  },
};

const ANIMATION_CONFIG = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

// Memoized Components
const LoadingState = () => (
  <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
    <div className="flex items-center space-x-2 text-yellow-400">
      <Loader2 className="w-6 h-6 animate-spin" />
      <span>Loading dashboard...</span>
    </div>
  </div>
);

const ErrorState = ({ error }) => (
  <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-yellow-400 mb-2">No data found</h2>
      <p className="text-gray-400">{error}</p>
    </div>
  </div>
);

const StatCard = ({ title, value, subtitle, icon: Icon, delay }) => (
  <motion.div
    {...ANIMATION_CONFIG}
    transition={{ ...ANIMATION_CONFIG.transition, delay }}
    className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm rounded-xl p-6 border border-yellow-400/10 hover:border-yellow-400/30 transition-colors group relative overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="relative">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
          <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
        </div>
        <div className="p-3 bg-gradient-to-br from-yellow-400/10 to-yellow-400/5 rounded-lg group-hover:from-yellow-400/20 group-hover:to-yellow-400/10 transition-colors">
          <Icon className="h-6 w-6 text-yellow-400" />
        </div>
      </div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { data: session } = useSession();
  const owner = session?.user;

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  const [error, setError] = useState(null);
  const [salesSelectedYear, setSalesSelectedYear] = useState("");
  const [salesViewType, setSalesViewType] = useState("currentYear");
  const [ratingsSelectedYear, setRatingsSelectedYear] = useState("");
  const [ratingsViewType, setRatingsViewType] = useState("currentYear");
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  const handleNavigation = (route) => {
    if (route === pathname) {
      return;
    }
    setIsPricingLoading(true);
  };

  useEffect(() => {
    return () => {
      setIsPricingLoading(false);
    };
  }, [pathname]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    // Check initially
    checkMobile();

    // Add event listener
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const formatNumber = (number) => {
    if (number >= 1e7) return (number / 1e7).toFixed(2) + " Cr"; // Crores
    if (number >= 1e5) return (number / 1e5).toFixed(2) + " Lakh"; // Lakhs
    if (number >= 1e3) return (number / 1e3).toFixed(2) + "K"; // Thousands
    return number.toFixed(2); // Default decimal format
  };

  // Replace axios with server action
  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDashboardMetrics({
        salesYear: salesSelectedYear || new Date().getFullYear(),
        salesViewType,
        ratingsYear: ratingsSelectedYear,
        ratingsViewType,
      });
      if (response?.success) {
        setMetrics(response.data);
      } else {
        setError(response?.message || "Failed to fetch dashboard metrics");
      }
    } catch (error) {
      setError("Failed to fetch dashboard metrics");
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(false);
    }
  }, [
    owner?.username,
    salesSelectedYear,
    salesViewType,
    ratingsSelectedYear,
    ratingsViewType,
  ]);

  useEffect(() => {
    if (owner?.username) {
      fetchMetrics();
    }
  }, [owner?.username, fetchMetrics]);

  // Memoized data calculations
  const feedbackRatioData = useMemo(() => {
    if (!metrics) return [];
    return [
      {
        name: "Feedbacks",
        value: metrics.feedbackRatio,
        fill: CHART_CONFIG.feedbackRatio.color,
      },
      {
        name: "Remaining",
        value: 100 - metrics.feedbackRatio,
        fill: "#FFFFFF",
        style: { filter: "drop-shadow(inset 0 0 8px rgba(0, 0, 0, 0.2))" },
      },
    ];
  }, [metrics]);

  const positiveNegativeData = useMemo(() => {
    if (!metrics) return [];
    return [
      {
        name: "Positive",
        value: metrics.positivePercentage,
        fill: CHART_CONFIG.feedbackRatio.color,
      },
      {
        name: "Negative",
        value: 100 - metrics.positivePercentage,
        fill: "#FFFFFF",
        style: { filter: "drop-shadow(inset 0 0 8px rgba(0, 0, 0, 0.2))" },
      },
    ];
  }, [metrics]);

  const ratingData = useMemo(() => {
    if (!metrics) return [];
    return Object.entries(metrics.averageRatings)
      .filter(([key]) => key !== "overAllRating")
      .map(([key, value]) => ({
        name: metrics.apiMetrics[key],
        value: value,
        fill: CHART_CONFIG.ratings.color,
      }));
  }, [metrics]);

  const performanceData = useMemo(() => {
    if (!metrics) return [];
    return [
      {
        name: metrics.bestPerforming.metric,
        value: metrics.bestPerforming.rating,
        fill: CHART_CONFIG.positive.color,
      },
      {
        name: metrics.worstPerforming.metric,
        value: metrics.worstPerforming.rating,
        fill: CHART_CONFIG.negative.color,
      },
    ];
  }, [metrics]);

  const historicalData = useMemo(() => {
    if (!metrics?.historicalRatings) return [];
    return metrics.historicalRatings;
  }, [metrics]);

  const salesData = useMemo(() => {
    if (!metrics?.salesData) return [];
    return metrics.salesData.map((item) => ({
      name: item.date,
      value: item.sales,
      fill: CHART_CONFIG.feedbackRatio.color,
    }));
  }, [metrics]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (isPricingLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div {...ANIMATION_CONFIG} className="mb-4 sm:mb-8">
          <h1 className="text-2xl text-center sm:text-3xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-400 text-center mt-2 text-sm sm:text-base">
            Comprehensive overview of your service performance and customer
            feedback
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
          <StatCard
            title="Total Sales"
            value={formatNumber(metrics.totalSales)}
            subtitle="Total sales amount (INR) "
            icon={TrendingUpDown}
            delay={0.1}
          />
          <StatCard
            title="Average Rating"
            value={metrics.averageOverallRating.toFixed(1)}
            subtitle="Overall satisfaction"
            icon={Star}
            delay={0.2}
          />
          <StatCard
            title="Average Response Time"
            value={metrics.averageResponseTime.toFixed(1)}
            subtitle="Avg. response time (in hours)"
            icon={Clock}
            delay={0.3}
          />

          <StatCard
            title="Average Revisit Frequency"
            value={`${metrics.averageRevisitFrequency} times`}
            subtitle="Avg. times customers revisit"
            icon={Repeat}
            delay={0.4}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-8">
          {/* Feedback Ratio Chart */}
          <Card className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border-yellow-400/10 hover:border-yellow-400/20 transition-colors group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <CardHeader className="items-center pb-2">
                <CardTitle className="text-yellow-400 text-lg">
                  Feedback Ratio
                </CardTitle>
                <CardDescription className="text-sm">
                  Percentage of invoices with feedback
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-2">
                <div className="flex flex-col sm:flex-row items-center justify-between">
                  <ChartContainer
                    config={CHART_CONFIG}
                    className="w-full sm:w-[60%] aspect-square max-h-[200px]"
                  >
                    <PieChart>
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Pie
                        data={feedbackRatioData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={80}
                        strokeWidth={4}
                        style={{
                          filter: "drop-shadow(0 0 8px rgba(234, 179, 8, 0.3))",
                        }}
                      >
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                >
                                  <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="text-2xl sm:text-3xl font-bold text-yellow-400 fill-yellow-400"
                                    style={{
                                      textShadow:
                                        "0 0 10px rgba(234, 179, 8, 0.5)",
                                    }}
                                  >
                                    {Math.round(metrics.feedbackRatio * 10) /
                                      10}
                                    %
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground text-xs"
                                  >
                                    Feedback Rate
                                  </tspan>
                                </text>
                              );
                            }
                          }}
                        />
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                  <div className="w-full sm:w-[40%] space-y-4 mt-4 sm:mt-0">
                    <div className="text-center sm:text-right">
                      <p className="text-gray-400 text-sm">Total Invoices</p>
                      <p className="text-xl sm:text-2xl font-bold text-white">
                        {metrics.totalInvoices}
                      </p>
                    </div>
                    <div className="text-center sm:text-right">
                      <p className="text-gray-400 text-sm">Total Feedbacks</p>
                      <p className="text-xl sm:text-2xl font-bold text-white">
                        {metrics.totalFeedbacks}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>

          {/* Positive/Negative Ratio Chart */}
          <Card className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border-yellow-400/10 hover:border-yellow-400/20 transition-colors group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <CardHeader className="items-center pb-2">
                <CardTitle className="text-yellow-400 text-lg">
                  Feedback Sentiment
                </CardTitle>
                <CardDescription className="text-sm">
                  Positive vs Negative Feedback
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-2">
                <div className="flex flex-col sm:flex-row items-center justify-between">
                  <ChartContainer
                    config={CHART_CONFIG}
                    className="w-full sm:w-[60%] aspect-square max-h-[200px]"
                  >
                    <PieChart>
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Pie
                        data={positiveNegativeData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={80}
                        strokeWidth={4}
                        style={{
                          filter: "drop-shadow(0 0 8px rgba(34, 197, 94, 0.3))",
                        }}
                      >
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                >
                                  <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="text-2xl sm:text-3xl font-bold text-yellow-400 fill-yellow-400"
                                    style={{
                                      textShadow:
                                        "0 0 10px rgba(234, 179, 8, 0.5)",
                                    }}
                                  >
                                    {metrics.positivePercentage.toFixed(1)}%
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground text-xsm"
                                  >
                                    Positive Feedbacks
                                  </tspan>
                                </text>
                              );
                            }
                          }}
                        />
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                  <div className="w-full sm:w-[40%] space-y-4 mt-4 sm:mt-0">
                    <div className="text-center sm:text-right">
                      <p className="text-gray-400 text-sm">
                        Positive Feedbacks
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-white">
                        {metrics.positiveFeedbacks}
                      </p>
                    </div>
                    <div className="text-center sm:text-right">
                      <p className="text-gray-400 text-sm">
                        Negative Feedbacks
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-white">
                        {metrics.negativeFeedbacks}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>

        {/* Bar Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-8">
          {/* Sales Analysis Bar Chart */}
          <Card className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border-yellow-400/10 hover:border-yellow-400/20 transition-colors group relative overflow-hidden flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {owner?.plan?.planName === "free" && (
              <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/70 text-center space-y-4 z-10 ">
                <div className="text-yellow-400">
                  <Lock size={32} />
                </div>
                <Link
                  href="/pricing"
                  onClick={() => handleNavigation("/pricing")}
                >
                  <button className="bg-yellow-400 text-black px-4 py-2 rounded-md text-sm font-semibold hover:bg-yellow-300 cursor-pointer">
                    Subscribe for Sales Analysis
                  </button>
                </Link>
              </div>
            )}

            <div className="relative flex flex-col flex-grow">
              <CardHeader className="items-start pb-2 pt-4 px-4 sm:px-6">
                <div className="flex flex-row sm:items-center sm:justify-between w-full gap-2 justify-between">
                  <div className="flex flex-col items-start">
                    <CardTitle className="text-yellow-400 text-sm sm:text-base">
                      Sales Analysis
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-400 mt-1">
                      Sales performance over time
                    </CardDescription>
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <Select
                      value={salesViewType}
                      onValueChange={(value) => {
                        setSalesViewType(value);
                        setSalesSelectedYear("");
                      }}
                    >
                      <SelectTrigger className="w-[100px] sm:w-[140px] text-xs sm:text-sm bg-[#0A0A0A] border-yellow-400/20 text-yellow-400 focus:ring-yellow-400">
                        <SelectValue placeholder="Select Time" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0A0A0A] border-yellow-400/20 text-yellow-400">
                        <SelectItem
                          value="currentMonth"
                          className="text-yellow-400 focus:bg-yellow-400/10 focus:text-yellow-300 text-xs sm:text-sm"
                        >
                          Current Month
                        </SelectItem>
                        <SelectItem
                          value="currentWeek"
                          className="text-yellow-400 focus:bg-yellow-400/10 focus:text-yellow-300 text-xs sm:text-sm"
                        >
                          Current Week
                        </SelectItem>
                        <SelectItem
                          value="currentYear"
                          className="text-yellow-400 focus:bg-yellow-400/10 focus:text-yellow-300 text-xs sm:text-sm"
                        >
                          Current Year
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={salesSelectedYear}
                      onValueChange={(value) => {
                        setSalesSelectedYear(value);
                        setSalesViewType("");
                      }}
                    >
                      <SelectTrigger className="w-[100px] sm:w-[120px] text-xs sm:text-sm bg-[#0A0A0A] border-yellow-400/20 text-yellow-400 focus:ring-yellow-400">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0A0A0A] border-yellow-400/20 text-yellow-400 max-h-48 overflow-y-auto">
                        {metrics?.availableYearsForSales?.map((year) => (
                          <SelectItem
                            key={year}
                            value={year.toString()}
                            className="text-yellow-400 focus:bg-yellow-400/10 focus:text-yellow-300 text-xs sm:text-sm"
                          >
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 px-1 pb-3 sm:px-2 sm:pb-4">
                <div className="h-[200px] sm:h-[300px] w-full">
                  <div className="h-full w-full">
                    <ChartContainer
                      config={CHART_CONFIG}
                      className="h-full w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={salesData}
                          margin={{
                            top: 25,
                            right: 5,
                            left: 5,
                            bottom: 5,
                          }}
                          barCategoryGap="20%"
                        >
                          <CartesianGrid
                            vertical={false}
                            stroke="#374151"
                            strokeDasharray="3 3"
                          />
                          <XAxis
                            dataKey="name"
                            type="category"
                            tickLine={false}
                            tickMargin={8}
                            axisLine={false}
                            stroke="#9CA3AF"
                            fontSize={isMobile ? 10 : 12}
                          />
                          <YAxis
                            type="number"
                            stroke="#9CA3AF"
                            fontSize={isMobile ? 10 : 12}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={5}
                            tickFormatter={(value) => `₹${value / 1000}k`}
                          />
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                            formatter={(value, name, props) => [`₹${value}`]}
                            labelClassName="font-bold text-sm"
                            wrapperClassName="[&_.recharts-tooltip-item]:!text-yellow-400"
                            className="bg-[#fff] border-yellow-400/20  "
                          />
                          <Bar
                            dataKey="value"
                            fill="#FACC15"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={isMobile ? 30 : 40}
                          ></Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>

          {/* Rating Trend Line Chart */}
          <Card className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border-yellow-400/10 hover:border-yellow-400/20 transition-colors group relative overflow-hidden flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            {owner?.plan?.planName === "free" && (
              <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/70 text-center space-y-4 z-10">
                <div className="text-yellow-400">
                  <Lock size={32} />
                </div>
                <Link
                  href="/pricing"
                  onClick={() => handleNavigation("/pricing")}
                >
                  <button className="bg-yellow-400 text-black px-4 py-2 rounded-md text-sm font-semibold hover:bg-yellow-300 cursor-pointer">
                    Subscribe for Rating Trends
                  </button>
                </Link>
              </div>
            )}
            <div className="relative flex flex-col flex-grow">
              <CardHeader className="items-start pb-2 pt-4 px-4 sm:px-6">
                <div className="flex flex-row sm:items-center sm:justify-between w-full gap-2 justify-between">
                  <div className="flex flex-col items-start">
                    <CardTitle className="text-yellow-400 text-sm sm:text-base">
                      Rating Trend
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-400 mt-1">
                      Overall rating over time
                    </CardDescription>
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <Select
                      value={ratingsViewType}
                      onValueChange={(value) => {
                        setRatingsViewType(value);
                        setRatingsSelectedYear("");
                      }}
                    >
                      <SelectTrigger className="w-[100px] sm:w-[140px] text-xs sm:text-sm bg-[#0A0A0A] border-yellow-400/20 text-yellow-400 focus:ring-yellow-400">
                        <SelectValue placeholder="Select Time" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0A0A0A] border-yellow-400/20 text-yellow-400">
                        <SelectItem
                          value="currentMonth"
                          className="text-yellow-400 focus:bg-yellow-400/10 focus:text-yellow-300 text-xs sm:text-sm"
                        >
                          Current Month
                        </SelectItem>
                        <SelectItem
                          value="currentWeek"
                          className="text-yellow-400 focus:bg-yellow-400/10 focus:text-yellow-300 text-xs sm:text-sm"
                        >
                          Current Week
                        </SelectItem>
                        <SelectItem
                          value="currentYear"
                          className="text-yellow-400 focus:bg-yellow-400/10 focus:text-yellow-300 text-xs sm:text-sm"
                        >
                          Current Year
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={ratingsSelectedYear}
                      onValueChange={(value) => {
                        setRatingsSelectedYear(value);
                        setRatingsViewType("");
                      }}
                    >
                      <SelectTrigger className="w-[100px] sm:w-[120px] text-xs sm:text-sm bg-[#0A0A0A] border-yellow-400/20 text-yellow-400 focus:ring-yellow-400">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0A0A0A] border-yellow-400/20 text-yellow-400 max-h-48 overflow-y-auto">
                        {metrics?.availableYearsForFeedbacks?.map((year) => (
                          <SelectItem
                            key={year}
                            value={year.toString()}
                            className="text-yellow-400 focus:bg-yellow-400/10 focus:text-yellow-300 text-xs sm:text-sm"
                          >
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 px-1 pb-3 sm:px-2 sm:pb-4">
                <div className="h-[200px] sm:h-[300px] w-full">
                  <div className="h-full w-full">
                    <ChartContainer
                      config={CHART_CONFIG}
                      className="h-full w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={historicalData}
                          margin={{
                            top: 15,
                            right: 15,
                            left: isMobile ? 15 : 15,
                            bottom: 50,
                          }}
                        >
                          <CartesianGrid
                            vertical={false}
                            stroke="#374151"
                            strokeDasharray="3 3"
                          />
                          <XAxis
                            dataKey="date"
                            stroke="#9CA3AF"
                            tickLine={false}
                            tickMargin={isMobile ? 7 : 10}
                            axisLine={false}
                            interval={0}
                            angle={isMobile ? -75 : -45}
                            textAnchor="end"
                            tick={{
                              fill: "#9CA3AF",
                              fontSize: isMobile ? 8 : 10,
                            }}
                          />
                          <YAxis
                            stroke="#9CA3AF"
                            domain={[0, 5]}
                            tickLine={false}
                            axisLine={false}
                            tick={{
                              fill: "#9CA3AF",
                              fontSize: 10,
                              display: isMobile ? "none" : "block",
                            }}
                            width={isMobile ? 0 : 25}
                            tickMargin={5}
                          />
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                          />
                          <Line
                            type="monotone"
                            dataKey="rating"
                            stroke="#FACC15"
                            strokeWidth={2}
                            dot={{
                              fill: "#FACC15",
                              r: 2,
                              strokeWidth: 1,
                              stroke: "#0A0A0A",
                            }}
                            activeDot={{
                              r: 4,
                              strokeWidth: 1,
                              stroke: "#FFFFFF",
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border-yellow-400/10 hover:border-yellow-400/20 transition-colors group relative overflow-hidden mb-4 sm:mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <CardHeader className="items-center pb-2">
              <CardTitle className="text-yellow-400 text-base">
                Performance Metrics
              </CardTitle>
              <CardDescription className="text-xs">
                Best & Worst Areas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Best Performing */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    Best: {metrics.bestPerforming.metric}
                  </span>
                  <span className="text-sm text-yellow-400">
                    {metrics.bestPerforming.rating}/5
                  </span>
                </div>
                <Progress
                  value={(metrics.bestPerforming.rating / 5) * 100}
                  className="h-2 bg-gradient-to-r from-gray-800 to-gray-700 [&>div]:bg-gradient-to-r [&>div]:from-yellow-500 [&>div]:to-yellow-400"
                />
              </div>

              {/* Worst Performing */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    Worst: {metrics.worstPerforming.metric}
                  </span>
                  <span className="text-sm text-gray-100">
                    {metrics.worstPerforming.rating}/5
                  </span>
                </div>
                <Progress
                  value={(metrics.worstPerforming.rating / 5) * 100}
                  className="h-2 bg-gradient-to-r from-gray-800 to-gray-700 [&>div]:bg-gradient-to-r [&>div]:from-gray-100 [&>div]:to-gray-200"
                />
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
          {/* Improvements */}
          <Card className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border-yellow-400/10 hover:border-yellow-400/20 transition-colors group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-yellow-400" />
                  <CardTitle className="text-yellow-400">
                    Areas for Improvement
                  </CardTitle>
                </div>
                <CardDescription>
                  AI-generated insights for better performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {metrics.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-yellow-400">•</span>
                      <span className="text-gray-300">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </div>
          </Card>

          {/* Strengths */}
          <Card className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border-yellow-400/10 hover:border-yellow-400/20 transition-colors group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <CardTitle className="text-yellow-400">
                    Key Strengths
                  </CardTitle>
                </div>
                <CardDescription>
                  AI-identified areas of excellence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {metrics.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-yellow-400">•</span>
                      <span className="text-gray-300">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
