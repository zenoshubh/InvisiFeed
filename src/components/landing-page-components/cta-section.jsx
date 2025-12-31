"use client";
import React from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CTASection = () => {
  const router = useRouter();
  const [isNavigatingToRegister1, setIsNavigatingToRegister1] = useState(false);
  const [isNavigatingToRegister2, setIsNavigatingToRegister2] = useState(false);
  return (
    <section className="py-24 bg-[#0A0A0A] relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0A0A0A] via-[#0A0A0A] to-[#000000] opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border border-yellow-400/20 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />

          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-8">
              Be among the first to experience smart invoice generation,
              authentic feedback, and actionable insights with InvisiFeed.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* Button for Get Started Free */}
              <Link href="/register" passHref>
                <motion.div
                  whileHover={
                    !isNavigatingToRegister1 ? { scale: 1.05 } : undefined
                  }
                  whileTap={
                    !isNavigatingToRegister1 ? { scale: 0.95 } : undefined
                  }
                  onClick={() => setIsNavigatingToRegister1(true)}
                  className="relative group flex items-center justify-center cursor-pointer gap-3 px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30"
                >
                  {/* Spinner and Loading Text */}
                  {isNavigatingToRegister1 ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-t-transparent border-black rounded-full animate-spin"></div>
                      <span className="text-lg">Loading...</span>
                    </div>
                  ) : (
                    // Default Button Content
                    <>
                      <span className="text-lg">Get Started Free</span>
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </motion.div>
              </Link>

              {/* Button for Sign In */}
              <Link href="/sign-in" passHref>
                <motion.div
                  whileHover={
                    !isNavigatingToRegister2 ? { scale: 1.05 } : undefined
                  }
                  whileTap={
                    !isNavigatingToRegister2 ? { scale: 0.95 } : undefined
                  }
                  onClick={() => setIsNavigatingToRegister2(true)}
                  className="relative group flex items-center justify-center cursor-pointer gap-3 px-8 py-4 bg-transparent border-2 border-yellow-400/20 hover:border-yellow-400/40 text-yellow-400 font-semibold rounded-xl transition-all duration-300"
                >
                  {/* Spinner and Loading Text */}
                  {isNavigatingToRegister2 ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-t-transparent border-yellow-400 rounded-full animate-spin"></div>
                      <span className="text-lg">Loading...</span>
                    </div>
                  ) : (
                    // Default Button Content
                    <span className="text-lg">Sign In</span>
                  )}
                </motion.div>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
