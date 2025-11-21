"use client";

import { motion } from "framer-motion";
import { TrendingUpDown, Star, Clock, Repeat } from "lucide-react";

const ANIMATION_CONFIG = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

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

export default function DashboardStats({ metrics }) {
  const formatNumber = (number) => {
    if (number >= 1e7) return (number / 1e7).toFixed(2) + " Cr";
    if (number >= 1e5) return (number / 1e5).toFixed(2) + " Lakh";
    if (number >= 1e3) return (number / 1e3).toFixed(2) + "K";
    return number.toFixed(2);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      <StatCard
        title="Total Sales"
        value={formatNumber(metrics.totalSales || 0)}
        subtitle="Total sales amount (INR)"
        icon={TrendingUpDown}
        delay={0.1}
      />
      <StatCard
        title="Average Rating"
        value={(metrics.averageOverallRating || 0).toFixed(1)}
        subtitle="Overall satisfaction"
        icon={Star}
        delay={0.2}
      />
      <StatCard
        title="Average Response Time"
        value={(metrics.averageResponseTime || 0).toFixed(1)}
        subtitle="Avg. response time (in hours)"
        icon={Clock}
        delay={0.3}
      />
      <StatCard
        title="Average Revisit Frequency"
        value={`${metrics.averageRevisitFrequency || 0} times`}
        subtitle="Avg. times customers revisit"
        icon={Repeat}
        delay={0.4}
      />
    </div>
  );
}
