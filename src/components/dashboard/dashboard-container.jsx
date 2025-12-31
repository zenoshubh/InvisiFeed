"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Lightbulb, Star } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DashboardStats from "./dashboard-stats";
import FeedbackRatioChart from "./feedback-ratio-chart";
import PositiveNegativeChart from "./positive-negative-chart";
import RatingsChart from "./ratings-chart";
import SalesAnalysisChart from "./sales-analysis-chart";
import RatingTrendsChart from "./rating-trends-chart";
import PerformanceMetrics from "./performance-metrics";

export default function DashboardContainer({ initialMetrics, isPro }) {
  const [metrics] = useState(initialMetrics);
  const [isLoading] = useState(false);

  // State for sales view
  const [salesViewType, setSalesViewType] = useState("currentMonth");
  const [salesSelectedYear, setSalesSelectedYear] = useState("");

  // State for ratings view
  const [ratingsViewType, setRatingsViewType] = useState("currentMonth");
  const [ratingsSelectedYear, setRatingsSelectedYear] = useState("");

  // Get filtered data based on selections
  const getSalesData = () => {
    if (!metrics?.historicalSales) return [];

    if (salesSelectedYear) {
      const yearData = metrics.historicalSales.byYear?.find(
        (y) => y.year.toString() === salesSelectedYear
      );
      return yearData?.data || [];
    }

    switch (salesViewType) {
      case "currentMonth":
        return metrics.historicalSales.currentMonth || [];
      case "currentWeek":
        return metrics.historicalSales.currentWeek || [];
      case "currentYear":
        return metrics.historicalSales.currentYear || [];
      default:
        return metrics.historicalSales.currentMonth || [];
    }
  };

  const getRatingsData = () => {
    if (!metrics?.historicalRatings) return [];

    if (ratingsSelectedYear) {
      const yearData = metrics.historicalRatings.byYear?.find(
        (y) => y.year.toString() === ratingsSelectedYear
      );
      return yearData?.data || [];
    }

    switch (ratingsViewType) {
      case "currentMonth":
        return metrics.historicalRatings.currentMonth || [];
      case "currentWeek":
        return metrics.historicalRatings.currentWeek || [];
      case "currentYear":
        return metrics.historicalRatings.currentYear || [];
      default:
        return metrics.historicalRatings.currentMonth || [];
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-yellow-400">Loading...</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-yellow-400">No metrics available</div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <div className="min-h-screen sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <DashboardStats metrics={metrics} />
          </motion.div>
        </motion.div>

        {/* First Row Charts */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
        >
          <motion.div variants={itemVariants}>
            <FeedbackRatioChart metrics={metrics} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <PositiveNegativeChart metrics={metrics} />
          </motion.div>
        </motion.div>

        {/* Sales Analysis & Rating Trends - Responsive Side by Side */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
        >
          <motion.div variants={itemVariants}>
            <SalesAnalysisChart
              isPro={isPro}
              salesData={getSalesData()}
              salesViewType={salesViewType}
              setSalesViewType={setSalesViewType}
              salesSelectedYear={salesSelectedYear}
              setSalesSelectedYear={setSalesSelectedYear}
              availableYears={metrics?.availableYearsForInvoices || []}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <RatingTrendsChart
              isPro={isPro}
              ratingsData={getRatingsData()}
              ratingsViewType={ratingsViewType}
              setRatingsViewType={setRatingsViewType}
              ratingsSelectedYear={ratingsSelectedYear}
              setRatingsSelectedYear={setRatingsSelectedYear}
              availableYears={metrics?.availableYearsForFeedbacks || []}
            />
          </motion.div>
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <PerformanceMetrics metrics={metrics} />
        </motion.div>

        {/* Insights Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6"
        >
          {/* Improvements */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border-yellow-400/10 hover:border-yellow-400/20 transition-colors group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <CardHeader>
                  <div className="flex items-center gap-2">
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
                  <ul className="flex flex-col gap-3">
                    {metrics.improvements?.map((improvement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-yellow-400">•</span>
                        <span className="text-gray-300">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </div>
            </Card>
          </motion.div>

          {/* Strengths */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border-yellow-400/10 hover:border-yellow-400/20 transition-colors group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <CardHeader>
                  <div className="flex items-center gap-2">
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
                  <ul className="flex flex-col gap-3">
                    {metrics.strengths?.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-yellow-400">•</span>
                        <span className="text-gray-300">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
