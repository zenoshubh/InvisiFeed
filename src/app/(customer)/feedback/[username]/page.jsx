import { redirect } from "next/navigation";
import FeedbackClient from "./client";
import LoadingScreen from "@/components/loading-screen";
import { Suspense } from "react";

export default async function FeedbackPage({ params, searchParams }) {
  const username = params.username;
  const invoiceNumber = searchParams.invoiceNo;

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
