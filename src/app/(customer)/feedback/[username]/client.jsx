"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Sparkles,
  Wand2,
  Loader2,
  Download,
  Printer,
  Gift,
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import confetti from "canvas-confetti";
import {
  BsEmojiAngryFill,
  BsEmojiSmileFill,
  BsEmojiNeutralFill,
  BsEmojiFrownFill,
  BsEmojiHeartEyesFill,
} from "react-icons/bs";
import {
  checkInvoiceValidity,
  generateFeedbackWithAI,
  generateSuggestionsWithAI,
  submitFeedback,
} from "@/actions/feedback";
import LoadingScreen from "@/components/common/loading-screen";

const emojiOptions = [
  { value: 1, emoji: <BsEmojiAngryFill />, label: "Very Dissatisfied" },
  { value: 2, emoji: <BsEmojiFrownFill />, label: "Dissatisfied" },
  { value: 3, emoji: <BsEmojiNeutralFill />, label: "Neutral" },
  { value: 4, emoji: <BsEmojiSmileFill />, label: "Satisfied" },
  { value: 5, emoji: <BsEmojiHeartEyesFill />, label: "Very Satisfied" },
];

export default function FeedbackClient({ username, invoiceNumber }) {
  const [formData, setFormData] = useState({
    satisfactionRating: 3,
    communicationRating: 3,
    qualityOfServiceRating: 3,
    valueForMoneyRating: 3,
    recommendRating: 3,
    overAllRating: 3,
    feedbackContent: "",
    suggestionContent: "",
    anonymousFeedback: false,
  });

  const [businessName, setBusinessName] = useState("");
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [invalidInvoice, setInvalidInvoice] = useState(null);
  const [aiUsageCount, setAiUsageCount] = useState(0);
  const [aiLimitReached, setAiLimitReached] = useState(false);
  const [feedbackAlreadySubmitted, setFeedbackAlreadySubmitted] =
    useState(false);
  const [feedbackSubmittedSuccess, setFeedbackSubmittedSuccess] =
    useState(false);
  const [couponInfo, setCouponInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const maxCharCount = 500;
  const feedbackCharacterCount = formData.feedbackContent.length;
  const suggestionCharacterCount = formData.suggestionContent.length;

  const handleFeedbackChange = (e) => {
    if (e.target.value.length <= maxCharCount) {
      handleChange("feedbackContent", e.target.value);
    }
  };

  const handleSuggestionChange = (e) => {
    if (e.target.value.length <= maxCharCount) {
      handleChange("suggestionContent", e.target.value);
    }
  };

  useEffect(() => {
    const checkInvoice = async () => {
      try {
        const result = await checkInvoiceValidity(username, invoiceNumber);
        if (result.success) {
          setBusinessName(result.data?.businessName || "");
          setAiUsageCount(result.data?.aiUsageCount || 0);
          setInvalidInvoice(false);
        } else if (result.data?.alreadySubmitted) {
          setFeedbackAlreadySubmitted(true);
          setBusinessName(result.data?.businessName || "");
          setInvalidInvoice(false);
        } else {
          setInvalidInvoice(true);
          setBusinessName(result.data?.businessName || "");
        }
      } catch (error) {
        toast.error("Error checking invoice");
        setInvalidInvoice(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkInvoice();
  }, [username, invoiceNumber]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await submitFeedback(formData, username, invoiceNumber);
      if (result.success) {
        toast.success("Thank you for your feedback!");
        setCouponInfo({
          code: result.data?.couponCode || "N/A",
        });
        setFeedbackSubmittedSuccess(true);
        triggerConfetti();
      } else {
        toast.error(result.message || "Failed to submit feedback");
      }
    } catch (error) {
      toast.error("Error submitting feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateFeedbackAI = async () => {
    setLoadingFeedback(true);
    try {
      const result = await generateFeedbackWithAI(
        formData,
        username,
        invoiceNumber
      );
      if (result.success) {
        handleChange("feedbackContent", result.data?.feedback || result.feedback);
        setAiUsageCount(result.data?.aiUsageCount || result.aiUsageCount || 0);
        toast.success("Feedback generated!");
        if ((result.data?.aiUsageCount || result.aiUsageCount || 0) >= 3) {
          setAiLimitReached(true);
        }
      } else {
        toast.error(result.message || "Failed to generate feedback");
      }
    } catch (error) {
      toast.error("Error generating feedback");
    } finally {
      setLoadingFeedback(false);
    }
  };

  const generateSuggestionsAI = async () => {
    setLoadingSuggestion(true);
    try {
      const result = await generateSuggestionsWithAI(
        formData,
        username,
        invoiceNumber
      );
      if (result.success) {
        handleChange("suggestionContent", result.data?.suggestions || result.suggestions);
        setAiUsageCount(result.data?.aiUsageCount || result.aiUsageCount || 0);
        toast.success("Suggestions generated!");
        if ((result.data?.aiUsageCount || result.aiUsageCount || 0) >= 3) {
          setAiLimitReached(true);
        }
      } else {
        toast.error(result.message || "Failed to generate suggestions");
      }
    } catch (error) {
      toast.error("Error generating suggestions");
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const downloadCoupon = () => {
    if (!couponInfo?.code) return;
    
    const element = document.createElement("a");
    const file = new Blob(
      [
        `Coupon Code: ${couponInfo.code}\n\nThank you for your feedback!`,
      ],
      { type: "text/plain" }
    );
    element.href = URL.createObjectURL(file);
    element.download = `coupon-${couponInfo.code}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const printCoupon = () => {
    if (!couponInfo?.code) return;
    
    const printWindow = window.open("", "", "height=400,width=600");
    printWindow.document.write(`
      <html>
        <head>
          <title>Coupon</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .coupon { border: 2px dashed #EAB308; padding: 30px; text-align: center; border-radius: 10px; }
            h1 { color: #EAB308; }
            .code { font-size: 24px; font-weight: bold; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="coupon">
            <h1>Thank You!</h1>
            <div class="code">${couponInfo.code}</div>
            <p>Use this code for your next purchase</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  useEffect(() => {
    if (feedbackSubmittedSuccess && couponInfo) {
      triggerConfetti();
    }
  }, [feedbackSubmittedSuccess, couponInfo]);

  if (isLoading) return <LoadingScreen />;

  if (feedbackSubmittedSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#000000] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-yellow-400/10 to-yellow-400/5 border border-yellow-400/30 rounded-2xl p-8 max-w-md text-center"
        >
          <div className="mb-6">
            <Gift className="h-16 w-16 text-yellow-400 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
          <p className="text-gray-400 mb-6">Your feedback helps us improve</p>
          <div className="bg-black/40 rounded-lg p-4 mb-6">
            <p className="text-yellow-400 text-sm mb-2">Your Coupon Code</p>
            <p className="text-2xl font-bold text-white break-all">
              {couponInfo.code || "N/A"}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Use this code for your next purchase
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={downloadCoupon}
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black"
            >
              <Download className="h-4 w-4 mr-2" /> Download
            </Button>
            <Button
              onClick={printCoupon}
              variant="outline"
              className="flex-1 border-yellow-400/30 text-yellow-400"
            >
              <Printer className="h-4 w-4 mr-2" /> Print
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (feedbackAlreadySubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#000000] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-white mb-2">
            Feedback Already Submitted
          </h2>
          <p className="text-gray-400">
            Thank you for your feedback on this invoice
          </p>
        </motion.div>
      </div>
    );
  }

  if (invalidInvoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#000000] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-white mb-2">
            Invalid Invoice
          </h2>
          <p className="text-gray-400">
            {businessName
              ? `for ${businessName}`
              : "The feedback link is invalid or expired"}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#000000] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-4">
            Service Feedback for {businessName}
          </h1>
        </motion.div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Ratings Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-[#0A0A0A]/50 border-yellow-400/10">
              <CardHeader>
                <CardTitle className="text-white">
                  How satisfied are you?
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                {[
                  { key: "satisfactionRating", label: "Overall Satisfaction" },
                  { key: "communicationRating", label: "Communication" },
                  {
                    key: "qualityOfServiceRating",
                    label: "Quality of Service",
                  },
                  { key: "valueForMoneyRating", label: "Value for Money" },
                  { key: "recommendRating", label: "Likelihood to Recommend" },
                ].map((rating) => (
                  <div key={rating.key}>
                    <Label className="text-white text-lg mb-4 block">
                      {rating.label}
                    </Label>
                    <div className="flex gap-3 justify-start mb-2">
                      {emojiOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            handleChange(rating.key, option.value);
                            const avgRating =
                              (formData.satisfactionRating +
                                formData.communicationRating +
                                formData.qualityOfServiceRating +
                                formData.valueForMoneyRating +
                                formData.recommendRating) /
                              5;
                            handleChange(
                              "overAllRating",
                              Math.round(avgRating * 2) / 2
                            );
                          }}
                          className={`text-3xl p-2 rounded-full transition-all ${
                            formData[rating.key] === option.value
                              ? "text-yellow-400"
                              : "text-white hover:text-gray-300"
                          }`}
                          title={option.label}
                        >
                          {option.emoji}
                        </button>
                      ))}
                    </div>
                    <p className="text-yellow-400 text-sm">
                      {
                        emojiOptions.find(
                          (opt) => opt.value === formData[rating.key]
                        )?.label
                      }
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Feedback Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-[#0A0A0A]/50 border-yellow-400/10">
              <CardHeader>
                <CardTitle className="text-white">Your Feedback</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-gray-300">
                      Tell us your experience
                    </Label>
                    <span className="text-xs text-gray-500">
                      {feedbackCharacterCount}/{maxCharCount}
                    </span>
                  </div>
                  <Textarea
                    value={formData.feedbackContent}
                    onChange={handleFeedbackChange}
                    placeholder="Share your experience..."
                    className="bg-[#0A0A0A]/70 border-yellow-400/10 text-white min-h-[120px]"
                  />
                </div>
                <Button
                  type="button"
                  onClick={generateFeedbackAI}
                  disabled={loadingFeedback || aiLimitReached}
                  className="w-full bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 border border-yellow-400/30"
                >
                  {loadingFeedback ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />{" "}
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" /> Generate with AI (
                      {aiUsageCount}/3)
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Suggestions Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-[#0A0A0A]/50 border-yellow-400/10">
              <CardHeader>
                <CardTitle className="text-white">
                  Suggestions for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-gray-300">
                      What can we do better?
                    </Label>
                    <span className="text-xs text-gray-500">
                      {suggestionCharacterCount}/{maxCharCount}
                    </span>
                  </div>
                  <Textarea
                    value={formData.suggestionContent}
                    onChange={handleSuggestionChange}
                    placeholder="Share your suggestions..."
                    className="bg-[#0A0A0A]/70 border-yellow-400/10 text-white min-h-[120px]"
                  />
                </div>
                <Button
                  type="button"
                  onClick={generateSuggestionsAI}
                  disabled={loadingSuggestion || aiLimitReached}
                  className="w-full bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 border border-yellow-400/30"
                >
                  {loadingSuggestion ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />{" "}
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" /> Generate Ideas (
                      {aiUsageCount}/3)
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Anonymous Feedback */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.anonymousFeedback}
                onChange={(e) =>
                  handleChange("anonymousFeedback", e.target.checked)
                }
                className="w-4 h-4 rounded border-yellow-400/30 accent-yellow-400"
              />
              <span className="text-gray-300">
                Submit as anonymous feedback
              </span>
            </label>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-black font-medium h-12"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />{" "}
                  Submitting...
                </>
              ) : (
                "Submit Feedback"
              )}
            </Button>
          </motion.div>

          {/* Promotional Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="mt-8 sm:mt-10 text-center p-4 sm:p-6 rounded-lg border border-yellow-400/20 
                 bg-gradient-to-br from-yellow-400/10 hover:from-yellow-400/20 transition-all duration-300 max-w-2xl mx-auto"
          >
            <p className="text-sm sm:text-base text-gray-200 font-medium">
              Are you a service provider? Want to gather anonymous feedback and
              gain valuable insights from your customers?
            </p>
            <p className="text-sm sm:text-base text-yellow-400 font-semibold mt-2">
              Explore{" "}
              <a
                href="https://invisifeed.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-yellow-300"
              >
                InvisiFeed
              </a>{" "}
              now and transform the way you understand your audience!
            </p>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
