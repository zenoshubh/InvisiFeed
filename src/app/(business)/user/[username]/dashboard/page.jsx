import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/options";
import { getDashboardMetrics } from "@/fetchers/dashboard-metrics";
import DashboardContainer from "@/components/dashboard/dashboard-container";
import UserRatingsGraph from "@/components/business-page-components/user-ratings-graph";
import ScrollToTop from "@/components/common/scroll-to-top";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/sign-in");
  }

  // Check if user has pro plan
  const isPro = session.user?.plan?.planName !== "free";

  // Fetch dashboard metrics with default parameters
  const currentYear = new Date().getFullYear();
  const response = await getDashboardMetrics({
    salesYear: currentYear,
    salesViewType: "currentMonth",
    ratingsYear: currentYear,
    ratingsViewType: "currentMonth",
  });

  if (!response?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">
            Failed to load dashboard
          </h2>
          <p className="text-gray-400">
            {response?.message || "Please try again later"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <DashboardContainer initialMetrics={response.data} isPro={isPro} />
      <UserRatingsGraph />
      <ScrollToTop />
    </>
  );
}
