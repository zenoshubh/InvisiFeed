import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import LoadingScreen from "@/components/common/loading-screen";
import { Suspense } from "react";
import SignInClient from "./client";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);

  // If already logged in and username is available, redirect to dashboard
  if (session?.user?.username) {
    redirect(`/user/${session.user.username}/generate`);
  }

  return (
    <div>
      <Suspense fallback={<LoadingScreen />}>
        <SignInClient />
      </Suspense>
    </div>
  );
}
