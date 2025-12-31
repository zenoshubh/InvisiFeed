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
  positive: {
    label: "Positive",
    color: "#22C55E",
  },
  negative: {
    label: "Negative",
    color: "#EF4444",
  },
};

export default function PositiveNegativeChart({ metrics }) {
  const positiveNegativeData = [
    {
      name: "Positive",
      value: metrics.positivePercentage || 0,
      fill: "#EAB308",
    },
    {
      name: "Negative",
      value: 100 - (metrics.positivePercentage || 0),
      fill: "#FFFFFF",
      style: { filter: "drop-shadow(inset 0 0 8px rgba(0, 0, 0, 0.2))" },
    },
  ];

  return (
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
                                textShadow: "0 0 10px rgba(234, 179, 8, 0.5)",
                              }}
                            >
                              {(metrics.positivePercentage || 0).toFixed(1)}%
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
              </PieChart>
            </ChartContainer>
            <div className="w-full sm:w-[40%] flex flex-col gap-4 mt-4 sm:mt-0">
              <div className="text-center sm:text-right">
                <p className="text-gray-400 text-sm">Positive Feedbacks</p>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {metrics.positiveFeedbacks || 0}
                </p>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-gray-400 text-sm">Negative Feedbacks</p>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {metrics.negativeFeedbacks || 0}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
