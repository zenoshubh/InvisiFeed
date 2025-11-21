"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  FileText,
  QrCode,
  MessageSquare,
  CheckCircle,
  Star,
  ThumbsUp,
  Shield,
  Zap,
  BarChart,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
function HeroSection() {
  const router = useRouter();
  const [isLandscape, setIsLandscape] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  // Check device orientation and size
  useEffect(() => {
    const checkDevice = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
      // Consider devices between 768px and 1024px as tablets
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
      // Consider devices below 640px as small screens
      setIsSmallScreen(window.innerWidth < 640);
    };

    // Initial check
    checkDevice();

    // Add event listener for orientation changes
    window.addEventListener("resize", checkDevice);
    window.addEventListener("orientationchange", checkDevice);

    return () => {
      window.removeEventListener("resize", checkDevice);
      window.removeEventListener("orientationchange", checkDevice);
    };
  }, []);

  const pathname = usePathname();

  return (
    <section
      className={`relative bg-[#0A0A0A] flex items-center justify-center min-h-[calc(100vh-80px)]`}
      id="home"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0A0A0A] via-[#0A0A0A] to-[#000000] opacity-50" />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Desktop Layout */}
        <div className="hidden lg:flex h-full flex-row items-center justify-center gap-6 sm:gap-8">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 text-left w-full md:w-auto"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight"
            >
              Get Honest Feedback.{" "}
              <p className="text-yellow-400 text-2xl sm:text-3xl md:text-4xl font-bold">
                No Awkward Conversations.
              </p>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-base sm:text-lg text-gray-300 mb-4 sm:mb-6 leading-relaxed max-w-xl"
            >
              InvisiFeed helps you embed smart feedback forms inside your
              invoices so customers can give honest feedback.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto"
            >
              <Link href="/register" passHref>
                <motion.div
                  whileHover={!isNavigating ? { scale: 1.05 } : undefined}
                  whileTap={!isNavigating ? { scale: 0.95 } : undefined}
                  onClick={() => setIsNavigating(true)}
                  className="cursor-pointer group flex items-center justify-center space-x-2 sm:space-x-3 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 w-full sm:w-auto"
                >
                  {isNavigating ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-t-transparent border-gray-900 rounded-full animate-spin"></div>
                      <span className="text-sm sm:text-base">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm sm:text-base">
                        Generate Your First Smart Invoice
                      </span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Content - Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex-1 relative w-full md:w-auto mt-6 md:mt-0 "
          >
            <div className="relative w-full h-[300px] sm:h-[350px] md:h-[400px]">
              {/* Invoice with QR Code */}
              <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-white rounded-lg shadow-2xl transform rotate-3 z-10 hover:text-gray-300 transition-all duration-500 ease-in-out">
                <div className="p-3 sm:p-4">
                  <div className="flex justify-between items-center mb-3 sm:mb-4">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800">
                      INVOICE
                    </h3>
                    <div className="text-xs text-gray-500">#INV-2023-001</div>
                  </div>

                  <div className="border-t border-gray-200 pt-2 sm:pt-3 mb-3 sm:mb-4  ">
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 ">
                      <div>
                        <p className="text-xs text-gray-500">From:</p>
                        <p className="text-xs sm:text-sm font-medium">
                          Your Business Name
                        </p>
                        <p className="text-xs">123 Business St</p>
                        <p className="text-xs">City, State 12345</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">To:</p>
                        <p className="text-xs sm:text-sm font-medium">
                          Client Name
                        </p>
                        <p className="text-xs">456 Client Ave</p>
                        <p className="text-xs">City, State 67890</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-2 sm:pt-3 mb-3 sm:mb-4">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-xs text-gray-500">
                          <th className="pb-1">Description</th>
                          <th className="pb-1">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-gray-100">
                          <td className="py-1 text-xs sm:text-sm">
                            Service Description
                          </td>
                          <td className="py-1 text-xs sm:text-sm">$1,000.00</td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-gray-200">
                          <td className="py-1 text-xs sm:text-sm font-medium">
                            Total
                          </td>
                          <td className="py-1 text-xs sm:text-sm font-medium">
                            $1,000.00
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="border-t border-gray-200 pt-2 sm:pt-3 flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      Thank you for your business!
                    </div>
                    <div className="flex items-center space-x-1">
                      <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                      <span className="text-xs font-medium text-yellow-500">
                        Scan for feedback
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feedback Popup */}
              <div className="absolute bottom-0 left-0 w-[70%] h-[60%] bg-white rounded-lg shadow-2xl transform -rotate-2 z-20">
                <div className="p-3 sm:p-4">
                  <div className="flex justify-between items-center mb-2 sm:mb-3">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800">
                      Honest Feedback
                    </h3>
                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                  </div>

                  <div className="mb-3 sm:mb-4">
                    <p className="text-xs text-gray-600 mb-2 sm:mb-3">
                      We value your honest feedback to help us improve our
                      services. Your input plays a key role in shaping a better
                      experience for everyone.
                    </p>

                    <div className="mb-2 sm:mb-3">
                      <p className="text-xs mb-1 text-gray-900">
                        Overall Experience
                      </p>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div
                            key={star}
                            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-yellow-100 flex items-center justify-center"
                          >
                            <span className="text-yellow-500 text-xs">★</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-2 sm:mb-3">
                      <p className="text-xs  mb-1 text-gray-900">
                        What did you like most?
                      </p>
                      <textarea
                        className="w-full p-2 border border-gray-200 rounded-md text-xs resize-none"
                        rows="1"
                        placeholder="Your feedback here..."
                        disabled
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Mobile/Tablet Layout - Redesigned */}
        <div className="lg:hidden flex flex-col items-center justify-center">
          {/* Mobile Hero Content with Visual Elements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`w-full flex flex-col items-center justify-center ${
              isLandscape ? "space-y-6" : "space-y-8"
            }`}
          >
            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={`text-white text-center leading-tight ${
                isSmallScreen ? "text-2xl" : "text-3xl"
              } font-bold`}
            >
              Get Honest Feedback.{" "}
              <p className="text-yellow-400">No Awkward Conversations.</p>
            </motion.h1>

            {/* Brief Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className={`text-gray-300 text-center max-w-xs ${
                isSmallScreen ? "text-sm" : "text-base"
              }`}
            >
              Embed smart feedback forms in your invoices for honest customer
              insights.
            </motion.p>

            {/* Feature Icons Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className={`flex justify-center ${
                isLandscape ? "space-x-3" : "space-x-6"
              }`}
            >
              <div className="flex flex-col items-center">
                <div
                  className={`${
                    isSmallScreen ? "w-12 h-12" : "w-14 h-14"
                  } bg-yellow-400/10 rounded-full flex items-center justify-center mb-1`}
                >
                  <BarChart
                    className={`${
                      isSmallScreen ? "w-6 h-6" : "w-7 h-7"
                    } text-yellow-400`}
                  />
                </div>
                <span
                  className={`${
                    isSmallScreen ? "text-xs" : "text-sm"
                  } text-gray-300`}
                >
                  Smart Analysis
                </span>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className={`${
                    isSmallScreen ? "w-12 h-12" : "w-14 h-14"
                  } bg-yellow-400/10 rounded-full flex items-center justify-center mb-1`}
                >
                  <Shield
                    className={`${
                      isSmallScreen ? "w-6 h-6" : "w-7 h-7"
                    } text-yellow-400`}
                  />
                </div>
                <span
                  className={`${
                    isSmallScreen ? "text-xs" : "text-sm"
                  } text-gray-300`}
                >
                  Anonymous
                </span>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className={`${
                    isSmallScreen ? "w-12 h-12" : "w-14 h-14"
                  } bg-yellow-400/10 rounded-full flex items-center justify-center mb-1`}
                >
                  <Zap
                    className={`${
                      isSmallScreen ? "w-6 h-6" : "w-7 h-7"
                    } text-yellow-400`}
                  />
                </div>
                <span
                  className={`${
                    isSmallScreen ? "text-xs" : "text-sm"
                  } text-gray-300`}
                >
                  AI-Powered
                </span>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="w-full max-w-xs mx-auto"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`cursor-pointer group w-full flex items-center justify-center space-x-2 ${
                  isSmallScreen ? "px-5 py-2.5" : "px-7 py-3.5"
                } bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30`}
                onClick={() => router.push("/register")}
              >
                <span className={`${isSmallScreen ? "text-base" : "text-lg"}`}>
                  Get Started
                </span>
                <ArrowRight
                  className={`${
                    isSmallScreen ? "w-4 h-4" : "w-5 h-5"
                  } transition-transform group-hover:translate-x-1`}
                />
              </motion.button>
            </motion.div>

            {/* Bottom Visual Element - Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="w-full max-w-xs mx-auto"
            >
              <div
                className={`bg-gradient-to-r from-yellow-500/10 to-yellow-400/5 rounded-xl ${
                  isSmallScreen ? "p-3.5" : "p-4.5"
                } border border-yellow-400/20`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <ThumbsUp
                      className={`${
                        isSmallScreen ? "w-5 h-5" : "w-6 h-6"
                      } text-yellow-400 mr-2`}
                    />
                    <span
                      className={`${
                        isSmallScreen ? "text-sm" : "text-base"
                      } text-gray-300`}
                    >
                      Boost Customer Loyalty
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle
                      className={`${
                        isSmallScreen ? "w-5 h-5" : "w-6 h-6"
                      } text-yellow-400 mr-2`}
                    />
                    <span
                      className={`${
                        isSmallScreen ? "text-sm" : "text-base"
                      } text-gray-300`}
                    >
                      Increase Sales by 40%
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
