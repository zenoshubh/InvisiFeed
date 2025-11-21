"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getFeedbacks } from "@/fetchers/feedbacks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Star,
  ArrowUpDown,
} from "lucide-react";
import { motion } from "motion/react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const RatingDisplay = ({ rating, label }) => (
  <div className="flex items-center space-x-2">
    <span className="text-gray-400">{label}:</span>
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"
          }`}
        />
      ))}
    </div>
  </div>
);

const CustomerDetails = ({ details, invoiceId }) => {
  return (
    <div className="mt-4 p-4 bg-gradient-to-br from-yellow-400/5 to-transparent rounded-lg border border-yellow-400/10">
      <h3 className="text-sm font-medium text-gray-400 mb-2">
        Customer Details
      </h3>
      {invoiceId ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-gray-400">Name:</span>
            <span className="ml-2 text-white">{details.customerName}</span>
          </div>
          <div>
            <span className="text-gray-400">Email:</span>
            <span className="ml-2 text-white">{details.customerEmail}</span>
          </div>
          {details.amount && (
            <div>
              <span className="text-gray-400">Amount:</span>
              <span className="ml-2 text-white">
                ₹{parseFloat(details.amount).toLocaleString("en-IN")}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-white">
          <span>Sent Anonymously</span>
        </div>
      )}
    </div>
  );
};

const CustomerFeedbacks = () => {
  const params = useParams();
  const { username } = params;
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  const fetchFeedbacks = async (page) => {
    try {
      setLoading(true);
      const result = await getFeedbacks({
        page,
        limit: 5,
        sortBy,
      });

      if (result.success) {
        const { data } = result;
        setFeedbacks(data.feedbacks);
        setTotalPages(data.totalPages);
        setHasNextPage(data.hasNextPage);
        setHasPrevPage(data.hasPrevPage);
        setError(null);
      } else {
        setError(result.message || "Failed to fetch feedbacks");
        setFeedbacks([]);
      }
    } catch (err) {
      setError("Failed to fetch feedbacks");
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks(currentPage);
  }, [currentPage, username, sortBy]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-yellow-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading feedbacks...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {feedbacks.length === 0 ? (
          <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-yellow-400 mb-2">
                No Feedbacks Found
              </h2>
              <p className="text-gray-400">
                This business hasn't received any feedbacks yet.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-400 bg-clip-text text-transparent">
                Customer Feedbacks
              </h2>
              <div className="flex items-center space-x-2">
                <ArrowUpDown className="w-4 h-4 text-yellow-400" />
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[180px] bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 border-yellow-400/20 text-yellow-400">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A0A0A] border-yellow-400/20">
                    <SelectItem
                      value="newest"
                      className="text-yellow-400 hover:bg-yellow-400/10"
                    >
                      Newest First
                    </SelectItem>
                    <SelectItem
                      value="oldest"
                      className="text-yellow-400 hover:bg-yellow-400/10"
                    >
                      Oldest First
                    </SelectItem>
                    <SelectItem
                      value="highest"
                      className="text-yellow-400 hover:bg-yellow-400/10"
                    >
                      Highest Rated
                    </SelectItem>
                    <SelectItem
                      value="lowest"
                      className="text-yellow-400 hover:bg-yellow-400/10"
                    >
                      Lowest Rated
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-6">
              {feedbacks.map((feedback, index) => (
                <motion.div
                  key={feedback._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border-yellow-400/10 hover:border-yellow-400/20 transition-colors group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg text-yellow-400">
                            {format(
                              new Date(feedback.createdAt),
                              "MMM dd, yyyy hh:mm a"
                            )}{" "}
                            IST
                          </CardTitle>
                          <div className="flex items-center space-x-1.5 bg-gradient-to-br from-yellow-400/10 to-yellow-400/5 px-3 py-1.5 rounded-full border border-yellow-400/20 group-hover:from-yellow-400/20 group-hover:to-yellow-400/10 transition-colors">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-yellow-400 font-medium">
                              {feedback.overAllRating}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {feedback.customerDetails && (
                          <CustomerDetails
                            details={feedback.customerDetails}
                            invoiceId={feedback.invoiceId}
                          />
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <RatingDisplay
                            rating={feedback.satisfactionRating}
                            label="Satisfaction"
                          />
                          <RatingDisplay
                            rating={feedback.communicationRating}
                            label="Communication"
                          />
                          <RatingDisplay
                            rating={feedback.qualityOfServiceRating}
                            label="Quality"
                          />
                          <RatingDisplay
                            rating={feedback.valueForMoneyRating}
                            label="Value"
                          />
                          <RatingDisplay
                            rating={feedback.recommendRating}
                            label="Recommendation"
                          />
                          <RatingDisplay
                            rating={feedback.overAllRating}
                            label="Overall"
                          />
                        </div>

                        {feedback.feedbackContent && (
                          <div className="mt-4">
                            <h3 className="text-sm font-medium text-gray-400 mb-2">
                              Feedback
                            </h3>
                            <p className="text-white">
                              {feedback.feedbackContent}
                            </p>
                          </div>
                        )}

                        {feedback.suggestionContent && (
                          <div className="mt-4">
                            <h3 className="text-sm font-medium text-gray-400 mb-2">
                              Suggestions
                            </h3>
                            <p className="text-white">
                              {feedback.suggestionContent}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center items-center space-x-4 mt-8">
              <Button
                variant="outline"
                onClick={handlePrevPage}
                disabled={!hasPrevPage}
                className="border-yellow-400/20 bg-gradient-to-r from-yellow-500 to-yellow-400 text-white hover:from-yellow-600 hover:to-yellow-500 transition-all duration-200 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30"
              >
                <ChevronLeft className="w-4 h-4 m-1" />
              </Button>
              <span className="text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={!hasNextPage}
                className="border-yellow-400/20 bg-gradient-to-r from-yellow-500 to-yellow-400 text-white hover:from-yellow-600 hover:to-yellow-500 transition-all duration-200 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30"
              >
                <ChevronRight className="w-4 h-4 m-1" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerFeedbacks;
