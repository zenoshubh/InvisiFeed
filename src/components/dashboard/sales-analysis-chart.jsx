"use client";

import { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useRouter } from "next/navigation";

const CHART_CONFIG = {
  sales: {
    label: "Sales",
    color: "#FACC15",
  },
};

export default function SalesAnalysisChart({
  isPro,
  salesData,
  salesViewType,
  setSalesViewType,
  salesSelectedYear,
  setSalesSelectedYear,
  availableYears,
}) {
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const formatCurrency = (value) => {
    return `₹${value.toLocaleString()}`;
  };

  return (
    <Card className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border-yellow-400/10 hover:border-yellow-400/20 transition-colors group relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative">
        {!isPro && (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/70 text-center gap-4 z-10">
            <Lock className="h-12 w-12 text-yellow-400" />
            <p className="text-yellow-400 text-center">
              Upgrade to Pro to unlock Sales Analysis
            </p>
            <Button
              onClick={() => router.push("/user/pricing")}
              className="bg-yellow-400 text-black px-4 py-2 rounded-md text-sm font-semibold hover:bg-yellow-300 cursor-pointer"
            >
              Subscribe for Sales Analysis
            </Button>
          </div>
        )}
        <CardHeader className="items-start pb-2 pt-4 px-4 sm:px-6">
          <div className="flex flex-row sm:items-center sm:justify-between w-full gap-2 justify-between">
            <div className="flex flex-col items-start">
              <CardTitle className="text-yellow-400 text-sm sm:text-base">
                Sales Analysis
              </CardTitle>
              <CardDescription className="text-xs text-gray-400 mt-1">
                Revenue trends over time
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
                  {availableYears?.map((year) => (
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
              <ChartContainer config={CHART_CONFIG} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salesData}
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
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={formatCurrency}
                      tick={{
                        fill: "#9CA3AF",
                        fontSize: 10,
                        display: isMobile ? "none" : "block",
                      }}
                      width={isMobile ? 0 : 70}
                      tickMargin={5}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar dataKey="sales" fill="#FACC15" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
