"use client";

import React from "react";
import { motion } from "motion/react";
import {
  Shield,
  Lock,
  FileCheck,
  EyeOff,
  Database,
  CheckCircle,
  Building2,
} from "lucide-react";

const securityFeatures = [
  {
    title: "No Permanent Storage",
    description:
      "We do NOT store your invoices permanently. Your data privacy is our top priority.",
    icon: Database,
    delay: 0.1,
  },
  {
    title: "Data Ownership",
    description:
      "All data is owned and controlled by you. You have full control over your information.",
    icon: Lock,
    delay: 0.2,
  },
  {
    title: "DPDPA Compliant",
    description:
      "Our platform adheres to DPDPA regulations to ensure your data is protected.",
    icon: FileCheck,
    delay: 0.3,
  },
  {
    title: "GSTIN Verification",
    description:
      "We verify your GSTIN to ensure that you are a registered business.",
    icon: Building2,
    delay: 0.4,
  },
  {
    title: "Anonymous Feedback",
    description:
      "Customers may choose to submit feedback anonymously to encourage honesty.",
    icon: EyeOff,
    delay: 0.5,
  },
  {
    title: "Verified Security",
    description:
      "Our security measures are regularly audited and verified by developers.",
    icon: CheckCircle,
    delay: 0.6,
  },
];

const SecuritySection = () => {
  return (
    <section className="py-24 bg-[#0A0A0A] relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0A0A0A] via-[#0A0A0A] to-[#000000] opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Security & Privacy Assurance
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Your data security is our top priority. We implement
            industry-leading security measures to protect your information.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {securityFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: feature.delay }}
              >
                <div className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border border-yellow-400/10 rounded-xl p-6 h-full hover:border-yellow-400/20 transition-colors group">
                  <div className="w-12 h-12 bg-yellow-400/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-yellow-400" />
                  </div>
                  <h3 className="text-yellow-400 font-medium mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
