"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Label } from "recharts";

const CHART_CONFIG = {
  feedbackRatio: {
    label: "Feedback Ratio",
    color: "#EAB308",
  },
  remaining: {
    label: "Remaining",
    color: "#1F2937",
  },
};

export default function FeedbackRatioChart({ metrics }) {
  const feedbackRatioData = [
    {
      name: "Feedbacks",
      value: metrics.feedbackRatio || 0,
      fill: "#EAB308",
    },
    {
      name: "Remaining",
      value: 100 - (metrics.feedbackRatio || 0),
      fill: "#FFFFFF",
      style: { filter: "drop-shadow(inset 0 0 8px rgba(0, 0, 0, 0.2))" },
    },
  ];

  return (
    <Card className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border-yellow-400/10 hover:border-yellow-400/20 transition-colors group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative">
        <CardHeader className="items-center pb-2">
          <CardTitle className="text-yellow-400 text-lg">Feedback Ratio</CardTitle>
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
                                textShadow: "0 0 10px rgba(234, 179, 8, 0.5)",
                              }}
                            >
                              {Math.round((metrics.feedbackRatio || 0) * 10) / 10}%
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
                  {metrics.totalInvoices || 0}
                </p>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-gray-400 text-sm">Total Feedbacks</p>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {metrics.totalFeedbacks || 0}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
