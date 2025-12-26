import { redirect } from "next/navigation";
import FeedbackClient from "./client";
import LoadingScreen from "@/components/common/loading-screen";
import { Suspense } from "react";

export default async function FeedbackPage({ params, searchParams }) {
  // Await params and searchParams (Next.js 15 requirement)
  const { username } = await params;
  const resolvedSearchParams = await searchParams;
  const invoiceNumber = resolvedSearchParams.invoiceNo;

  // Basic validation
  if (!username || !invoiceNumber) {
    redirect("/");
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <FeedbackClient
        username={decodeURIComponent(username)}
        invoiceNumber={decodeURIComponent(invoiceNumber)}
      />
    </Suspense>
  );
}
