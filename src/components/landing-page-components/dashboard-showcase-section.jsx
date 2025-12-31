"use client";

import React from "react";
import { motion } from "motion/react";
import {
  BarChart,
  PieChart,
  LineChart,
  TrendingUp,
  Star,
  ThumbsUp,
  ThumbsDown,
  TrendingUpDown,
  Clock,
  Repeat,
  Lightbulb,
} from "lucide-react";
import {
  BarChart as RechartsBarChart,
  PieChart as RechartsPieChart,
  LineChart as RechartsLineChart,
  Bar,
  Pie,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Label,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


const DashboardShowcaseSection = () => {
  // Mock data for charts
  const feedbackRatioData = [
    { name: "Feedbacks", value: 75 , fill: "#EAB308" },
    { name: "Remaining", value: 25 , fill: "#FFFFFF" },
  ];

  const positiveNegativeData = [
    { name: "Positive", value: 85 , fill: "#EAB308" },
    { name: "Negative", value: 15 , fill: "#FFFFFF" },
  ];

  const ratingData = [
    { name: "Satisfaction", value: 4.8 },
    { name: "Communication", value: 4.6 },
    { name: "Quality", value: 4.7 },
    { name: "Value", value: 4.5 },
    { name: "Recommend", value: 4.9 },
  ];

  const performanceData = [
    { name: "Best", value: 4.9 },
    { name: "Worst", value: 4.2 },
  ];

  const historicalData = [
    { date: "Jan", rating: 4.2 },
    { date: "Feb", rating: 4.3 },
    { date: "Mar", rating: 4.4 },
    { date: "Apr", rating: 4.5 },
    { date: "May", rating: 4.6 },
    { date: "Jun", rating: 4.7 },
  ];

  const salesData = [
    { name: "Jan", value: 150000 },
    { name: "Feb", value: 180000 },
    { name: "Mar", value: 220000 },
    { name: "Apr", value: 250000 },
    { name: "May", value: 280000 },
    { name: "Jun", value: 300000 },
  ];

  const COLORS = ["#FCD34D", "#FBBF24", "#F59E0B", "#D97706", "#B45309"];

  return (
    <section className="py-12 sm:py-24 bg-[#0A0A0A] relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0A0A0A] via-[#0A0A0A] to-[#000000] opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-8 sm:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4"
          >
            Powerful Dashboard Insights
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto"
          >
            Visualize your feedback data with comprehensive analytics and
            AI-powered insights
          </motion.p>
        </div>

        {/* Stats Grid */}
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-8 px-4 place-items-center">
          {/* Single Stat Card */}
          {[
            {
              title: "Total Sales",
              value: "₹2.5M",
              desc: "Total sales amount (INR)",
              Icon: TrendingUpDown,
            },
            {
              title: "Average Rating",
              value: "4.7",
              desc: "Overall satisfaction",
              Icon: Star,
            },
            {
              title: "Response Time",
              value: "2.5",
              desc: "Avg. response time (hours)",
              Icon: Clock,
            },
            {
              title: "Revisit Frequency",
              value: "3.2",
              desc: "Avg. times customers revisit",
              Icon: Repeat,
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
              className="group relative w-full bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-md rounded-2xl p-6 border border-yellow-400/10 hover:border-yellow-400/30 transition-colors overflow-hidden"
            >
              {/* Background Hover Light */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Main Content */}
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{item.title}</p>
                  <h3 className="text-2xl font-bold text-white mt-1 group-hover:text-yellow-400 transition-colors duration-300">
                    {item.value}
                  </h3>
                  <p className="text-gray-500 text-xs mt-1">{item.desc}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-yellow-400/10 to-yellow-400/5 rounded-lg group-hover:from-yellow-400/20 group-hover:to-yellow-400/10 transition-colors">
                  <item.Icon className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-8">
          {/* Feedback Ratio Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border border-yellow-400/10 rounded-xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-yellow-400 font-medium text-sm sm:text-base">
                Feedback Ratio
              </h3>
              <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
            </div>
            <div className="h-48 sm:h-64 w-full overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <ChartContainer
                  className="w-full sm:w-[60%] aspect-square max-h-[200px]"
                >
                  <RechartsPieChart>
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
                                  75%
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
                  </RechartsPieChart>
                </ChartContainer>
                <div className="w-full sm:w-[40%] flex flex-col gap-4 mt-4 sm:mt-0">
                  <div className="text-center sm:text-right">
                    <p className="text-gray-400 text-sm">Total Invoices</p>
                    <p className="text-xl sm:text-2xl font-bold text-white">
                      1,500
                    </p>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-gray-400 text-sm">Total Feedbacks</p>
                    <p className="text-xl sm:text-2xl font-bold text-white">
                      1,125
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Positive/Negative Ratio Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border border-yellow-400/10 rounded-xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-yellow-400 font-medium text-sm sm:text-base">
                Feedback Sentiment
              </h3>
              <div className="flex flex-row gap-2">
                <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                <ThumbsDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              </div>
            </div>
            <div className="h-48 sm:h-64 w-full overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <ChartContainer
                  className="w-full sm:w-[60%] aspect-square max-h-[200px]"
                >
                  <RechartsPieChart>
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
                      fill="#FACC15"

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
                                  85%
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 24}
                                  className="fill-muted-foreground text-xs"
                                >
                                  Positive Feedbacks
                                </tspan>
                              </text>
                            );
                          }
                        }}
                      />
                    </Pie>
                  </RechartsPieChart>
                </ChartContainer>
                <div className="w-full sm:w-[40%] flex flex-col gap-4 mt-4 sm:mt-0">
                  <div className="text-center sm:text-right">
                    <p className="text-gray-400 text-sm">Positive Feedbacks</p>
                    <p className="text-xl sm:text-2xl font-bold text-white">
                      956
                    </p>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-gray-400 text-sm">Negative Feedbacks</p>
                    <p className="text-xl sm:text-2xl font-bold text-white">
                      169
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bar Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-8">
          {/* Sales Analysis Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border border-yellow-400/10 rounded-xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-yellow-400 font-medium text-sm sm:text-base">
                Sales Analysis
              </h3>
              <BarChart className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
            </div>
            <div className="h-48 sm:h-64 w-full overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={salesData}
                  margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#888" tick={{ fontSize: 12 }} />
                  <YAxis
                    stroke="#888"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `₹${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0A0A0A",
                      border: "1px solid rgba(251, 191, 36, 0.2)",
                      borderRadius: "0.5rem"
                    }}
                    cursor={{ fill: "rgba(38, 35, 24, 0.5)" }}
                    formatter={(value) => [`₹${value}`, "Sales"]}
                  />
                  <Bar dataKey="value" fill="#FACC15" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Rating Trend Line Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border border-yellow-400/10 rounded-xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-yellow-400 font-medium text-sm sm:text-base">
                Rating Trend
              </h3>
              <LineChart className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
            </div>
            <div className="h-48 sm:h-64 w-full overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart
                  data={historicalData}
                  margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#888" tick={{ fontSize: 12 }} />
                  <YAxis
                    stroke="#888"
                    domain={[3.5, 5]}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0A0A0A",
                      border: "1px solid rgba(251, 191, 36, 0.2)",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="#FACC15"
                    strokeWidth={2}
                    dot={{ fill: "#FACC15", r: 3 }}
                    activeDot={{ r: 5, fill: "#FACC15" }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border border-yellow-400/10 rounded-xl p-4 sm:p-6 mb-4 sm:mb-8"
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-yellow-400 font-medium text-sm sm:text-base">
              Performance Metrics
            </h3>
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
          </div>
          <div className="flex flex-col gap-6">
            {/* Best Performing */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  Best: Customer Service
                </span>
                <span className="text-sm text-yellow-400">4.9/5</span>
              </div>
              <Progress
                value={98}
                className="h-2 bg-gradient-to-r from-gray-800 to-gray-700 [&>div]:bg-gradient-to-r [&>div]:from-yellow-500 [&>div]:to-yellow-400"
              />
            </div>

            {/* Worst Performing */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  Worst: Delivery Time
                </span>
                <span className="text-sm text-gray-100">4.2/5</span>
              </div>
              <Progress
                value={84}
                className="h-2 bg-gradient-to-r from-gray-800 to-gray-700 [&>div]:bg-gradient-to-r [&>div]:from-gray-100 [&>div]:to-gray-200"
              />
            </div>
          </div>
        </motion.div>

        {/* Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
          {/* Improvements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border border-yellow-400/10 rounded-xl p-4 sm:p-6"
          >
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Lightbulb className="h-5 w-5 text-yellow-400" />
              <h3 className="text-yellow-400 font-medium text-sm sm:text-base">
                Areas for Improvement
              </h3>
            </div>
            <ul className="flex flex-col gap-3">
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">•</span>
                <span className="text-gray-300">
                  Optimize delivery time consistency
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">•</span>
                <span className="text-gray-300">
                  Enhance product packaging quality
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">•</span>
                <span className="text-gray-300">
                  Improve after-sales support response time
                </span>
              </li>
            </ul>
          </motion.div>

          {/* Strengths */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border border-yellow-400/10 rounded-xl p-4 sm:p-6"
          >
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Star className="h-5 w-5 text-yellow-400" />
              <h3 className="text-yellow-400 font-medium text-sm sm:text-base">
                Key Strengths
              </h3>
            </div>
            <ul className="flex flex-col gap-3">
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">•</span>
                <span className="text-gray-300">
                  Excellent customer service responsiveness
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">•</span>
                <span className="text-gray-300">
                  High product quality standards
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">•</span>
                <span className="text-gray-300">
                  Strong customer loyalty and repeat business
                </span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* User Ratings Graph */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8 sm:mt-12"
        >
          <Card className="w-full max-w-6xl mx-auto bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border-yellow-400/10 hover:border-yellow-400/20 transition-colors group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <CardHeader className="border-b border-yellow-400/20 px-3 sm:px-6">
                <CardTitle className="text-base sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-400 bg-clip-text text-transparent text-center sm:text-left">
                  Average Ratings for Sample Business
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="flex flex-col gap-4 sm:gap-6">
                  {ratingData.map((rating, index) => (
                    <div key={index} className="flex flex-col gap-2">
                      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-1 sm:gap-2">
                        <span className="text-gray-300 text-xs sm:text-base order-1 sm:order-none text-center sm:text-left">
                          {rating.name}
                        </span>
                        <span className="text-yellow-400 font-semibold text-sm sm:text-lg order-2 sm:order-none">
                          {rating.value}/5
                        </span>
                      </div>
                      <Progress
                        value={(rating.value / 5) * 100}
                        className="h-2 sm:h-3 bg-gradient-to-r from-gray-800 to-gray-700 [&>div]:bg-gradient-to-r [&>div]:from-yellow-500 [&>div]:to-yellow-400"
                      />
                    </div>
                  ))}
                  <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-yellow-400/20">
                    <p className="text-gray-400 text-xs sm:text-base text-center">
                      Based on 150 feedbacks
                    </p>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default DashboardShowcaseSection;
