import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import LoadingScreen from "@/components/LoadingScreen";
import { Suspense } from "react";
import SignInClient from "./client";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);

  // If already logged in, redirect to dashboard or home
  if (session) {
    redirect(`/user/${session.user.username}/dashboard`);
  }

  return (
    <div>
      <Suspense fallback={<LoadingScreen />}>
        <SignInClient />
      </Suspense>
    </div>
  );
}
