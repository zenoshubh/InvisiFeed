"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useSession } from "next-auth/react";

export default function UserRatingsGraph() {
  const { data: session } = useSession();
  const owner = session?.user;
  const [ratings, setRatings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const { getUserRatings } = await import("@/fetchers/user-ratings");
        const result = await getUserRatings();
        if (result.success) {
          setRatings(result.data);
        } else {
          setError(result.message || "Failed to fetch ratings");
        }
      } catch (error) {
        setError("Failed to fetch ratings");
        console.error("Error fetching ratings:", error);
      } finally {
        setLoading(false);
      }
    };

    if (owner?.username) {
      fetchRatings();
    }
  }, [owner]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-yellow-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading ratings...</span>
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

  if (!ratings || ratings.totalFeedbacks === 0) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">
            No Ratings Found
          </h2>
          <p className="text-gray-400">
            This business hasn't received any ratings yet.
          </p>
        </div>
      </div>
    );
  }

  const ratingLabels = {
    satisfactionRating: "Satisfaction",
    communicationRating: "Communication",
    qualityOfServiceRating: "Quality of Service",
    valueForMoneyRating: "Value for Money",
    recommendRating: "Recommendation",
    overAllRating: "Overall Rating",
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-4 sm:py-12 px-2 sm:px-4">
      <Card className="w-full max-w-6xl mx-auto bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border-yellow-400/10 hover:border-yellow-400/20 transition-colors group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative">
          <CardHeader className="border-b border-yellow-400/20 px-3 sm:px-6">
            <CardTitle className="text-base sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-400 bg-clip-text text-transparent text-center sm:text-left">
              Average Ratings for {owner.businessName}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              {Object.entries(ratingLabels).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-1 sm:gap-2">
                    <span className="text-gray-300 text-xs sm:text-base order-1 sm:order-none text-center sm:text-left">
                      {label}
                    </span>
                    <span className="text-yellow-400 font-semibold text-sm sm:text-lg order-2 sm:order-none">
                      {ratings.averageRatings[key].toFixed(1)}/5
                    </span>
                  </div>
                  <Progress
                    value={(ratings.averageRatings[key] / 5) * 100}
                    className="h-2 sm:h-3 bg-gradient-to-r from-gray-800 to-gray-700 [&>div]:bg-gradient-to-r [&>div]:from-yellow-500 [&>div]:to-yellow-400"
                  />
                </div>
              ))}
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-yellow-400/20">
                <p className="text-gray-400 text-xs sm:text-base text-center">
                  Based on {ratings.totalFeedbacks} feedback
                  {ratings.totalFeedbacks !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
