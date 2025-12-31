"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function PerformanceMetrics({ metrics }) {
  return (
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
        <CardContent className="flex flex-col gap-6">
          {/* Best Performing */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">
                Best: {metrics?.bestPerforming?.metric || "N/A"}
              </span>
              <span className="text-sm text-yellow-400">
                {(metrics?.bestPerforming?.rating || 0).toFixed(1)}/5
              </span>
            </div>
            <Progress
              value={((metrics?.bestPerforming?.rating || 0) / 5) * 100}
              className="h-2 bg-gradient-to-r from-gray-800 to-gray-700 [&>div]:bg-gradient-to-r [&>div]:from-yellow-500 [&>div]:to-yellow-400"
            />
          </div>

          {/* Worst Performing */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">
                Worst: {metrics?.worstPerforming?.metric || "N/A"}
              </span>
              <span className="text-sm text-gray-100">
                {(metrics?.worstPerforming?.rating || 0).toFixed(1)}/5
              </span>
            </div>
            <Progress
              value={((metrics?.worstPerforming?.rating || 0) / 5) * 100}
              className="h-2 bg-gradient-to-r from-gray-800 to-gray-700 [&>div]:bg-gradient-to-r [&>div]:from-gray-100 [&>div]:to-gray-200"
            />
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
