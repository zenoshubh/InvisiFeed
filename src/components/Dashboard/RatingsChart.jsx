"use client";

import { motion } from "framer-motion";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const CHART_CONFIG = {
  ratings: {
    label: "Rating",
    color: "#FACC15",
  },
  label: {
    color: "#FFFFFF",
  },
};

export default function RatingsChart({ data, isMobile }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.6 }}
      className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm rounded-xl p-6 border border-yellow-400/10"
    >
      <h3 className="text-lg font-semibold text-white mb-4">
        Average Ratings by Category
      </h3>
      <ChartContainer config={CHART_CONFIG} className="h-[300px]">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
          <XAxis
            dataKey="name"
            stroke="#9CA3AF"
            angle={isMobile ? -45 : 0}
            textAnchor={isMobile ? "end" : "middle"}
            height={isMobile ? 80 : 30}
          />
          <YAxis stroke="#9CA3AF" domain={[0, 5]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar
            dataKey="value"
            fill={CHART_CONFIG.ratings.color}
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </motion.div>
  );
}
