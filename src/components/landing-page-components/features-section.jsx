"use client";
import React from "react";
import { motion } from "motion/react";
import {
  Shield,
  MessageSquare,
  BarChart,
  Users,
  Lock,
  Bell,
  TrendingUp,
  FileText,
  Gift,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    title: "Anonymous Feedback",
    description:
      "Collect honest feedback without compromising privacy of your customers",
    icon: Shield,
    delay: 0.1,
  },
  {
    title: "Real-time Analytics",
    description:
      "Get instant insights with detailed analytics of sales, feedback, and customer satisfaction",
    icon: BarChart,
    delay: 0.2,
  },
  {
    title: "Smart Invoice Generation",
    description:
      "Generate Smart Invoices for your customers with QR code/link to feedback form",
    icon: FileText,
    delay: 0.3,
  },
  {
    title: "Secure Platform",
    description: "Enterprise-grade security for your data and credentials",
    icon: Lock,
    delay: 0.4,
  },
  {
    title: "Create Coupons",
    description:
      "Create coupons for your customers to incentivize them to provide feedback",
    icon: Gift,
    delay: 0.5,
  },
  {
    title: "Performance Tracking",
    description:
      "Monitor and improve business performance with feedback analytics",
    icon: TrendingUp,
    delay: 0.6,
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-[#0A0A0A] relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0A0A0A] via-[#0A0A0A] to-[#000000] opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Powerful Features for Your Business
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Everything you need to collect, analyze, and act on feedback
            effectively
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: feature.delay }}
              >
                <Card className="bg-gradient-to-br h-full from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border-yellow-400/10 hover:border-yellow-400/20 transition-colors group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <CardHeader>
                      <div className="w-12 h-12 bg-yellow-400/10 rounded-lg flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-yellow-400" />
                      </div>
                      <CardTitle className="text-yellow-400">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
