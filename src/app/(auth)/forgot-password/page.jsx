import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import ForgotPassword from "./client";
import LoadingScreen from "@/components/common/loading-screen";
import { Suspense } from "react";

export default async function ForgotPasswordPage() {
  const session = await getServerSession(authOptions);

  // If already logged in, redirect to dashboard or home
  if (session) {
    redirect(`/user/${session.user.username}/dashboard`);
  }

  return (
    <div>
      <Suspense fallback={<LoadingScreen />}>
        <ForgotPassword />
      </Suspense>
    </div>
  );
}
