"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { Star, X } from "lucide-react";

import { toast } from "sonner";
import { submitReview } from "@/actions/review";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
const ReviewInvisifeed = () => {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const handleSubmitReview = async () => {
    if (!review.trim()) {
      toast.error("Please enter your review");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await submitReview(review);
      if (result.success) {
        toast.success("Thank you for your review!");
        setReview("");
        setIsReviewModalOpen(false);
      } else {
        if (result.message === "Unauthorized") {
          router.push("/sign-in");
        }
        toast.error(result.message || "Failed to submit review. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const { data: session } = useSession();
  const username = session?.user?.username;

  return (
    <section className="py-10 bg-[#0A0A0A] relative ">
      <div className="absolute inset-0   bg-gradient-to-br   hover:from-yellow-400/20 transition-all duration-300 opacity-50 border-yellow-400/20 rounded-xl border max-w-[90vw] mx-auto hover:border-yellow-400/40   " />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative ">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Share Your Thoughts
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Your feedback fuels our innovation! Join the conversation and help
            us grow.
          </motion.p>
        </div>

        <div className="text-center mt-12">
          <motion.button
            onClick={() => {
              if (!username) {
                router.push("/sign-in");
              } else {
                setIsReviewModalOpen(true);
              }
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="px-8 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition-colors cursor-pointer"
          >
            Review Us
          </motion.button>
        </div>
      </div>
      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0A0A0A] border border-yellow-400/20 rounded-xl p-6 max-w-lg w-full mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">
                Share Your Feedback
              </h3>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your suggestions, feedback, or report any issues..."
              className="w-full h-32 bg-[#1A1A1A] border border-yellow-400/20 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400/40 transition-colors resize-none"
            />

            <div className="flex justify-end mt-4">
              <button
                onClick={handleSubmitReview}
                disabled={isSubmitting}
                className="px-6 py-2 bg-yellow-400 cursor-pointer text-black font-semibold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Sending..." : "Send Feedback"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
};

export default ReviewInvisifeed;
