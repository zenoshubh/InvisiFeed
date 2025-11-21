"use client";

import React from "react";
import { motion } from "motion/react";
import { FileText, ArrowRight, QrCode } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
const SampleInvoiceSection = () => {
  const [isNavigatingToRegister, setIsNavigatingToRegister] = useState(false);
  return (
    <section className="py-24 bg-[#0A0A0A] relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0A0A0A] via-[#0A0A0A] to-[#000000] opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Try InvisiFeed with a{" "}
              <p className="text-yellow-400">Sample Invoice</p>
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Just sign in & explore. Test it out like any curious user.{" "}
            </p>
            <Link href="/register" passHref>
              <motion.div
                whileHover={
                  !isNavigatingToRegister ? { scale: 1.05 } : undefined
                }
                whileTap={!isNavigatingToRegister ? { scale: 0.95 } : undefined}
                onClick={() => setIsNavigatingToRegister(true)}
                className="relative group flex items-center justify-center cursor-pointer space-x-3 px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 max-w-fit"
              >
                {/* Spinner and Loading Text */}
                {isNavigatingToRegister ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-t-transparent border-black rounded-full animate-spin"></div>
                    <span className="text-lg">Loading...</span>
                  </div>
                ) : (
                  // Default Button Content
                  <>
                    <span className="text-lg">Try Sample Invoice</span>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </motion.div>
            </Link>
          </motion.div>

          {/* Right Content - Sample Invoice Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <FileText className="w-6 h-6 text-yellow-500 mr-2" />
                    <h3 className="text-xl font-bold text-gray-800">
                      SAMPLE INVOICE
                    </h3>
                  </div>
                  <div className="text-sm text-gray-500">#INV-SAMPLE-001</div>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">From:</p>
                      <p className="font-medium">InvisiFeed Demo</p>
                      <p className="text-sm">123 Demo Street</p>
                      <p className="text-sm">San Francisco, CA 94105</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">To:</p>
                      <p className="font-medium">Sample Customer</p>
                      <p className="text-sm">456 Customer Ave</p>
                      <p className="text-sm">New York, NY 10001</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500">
                        <th className="pb-2">Description</th>
                        <th className="pb-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-gray-100">
                        <td className="py-2">Web Design Services</td>
                        <td className="py-2">$1,500.00</td>
                      </tr>
                      <tr className="border-t border-gray-100">
                        <td className="py-2">Content Creation</td>
                        <td className="py-2">$800.00</td>
                      </tr>
                      <tr className="border-t border-gray-100">
                        <td className="py-2">SEO Optimization</td>
                        <td className="py-2">$700.00</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-gray-200">
                        <td className="py-2 font-medium">Total</td>
                        <td className="py-2 font-medium">$3,000.00</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Thank you for your business!
                  </div>
                  <div className="flex items-center space-x-2 bg-yellow-50 px-3 py-2 rounded-md">
                    <QrCode className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-600">
                      Scan for feedback
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-yellow-400/10 rounded-full blur-xl"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SampleInvoiceSection;
