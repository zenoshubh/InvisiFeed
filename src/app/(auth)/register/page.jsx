import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import RegisterClient from "./client";
import LoadingScreen from "@/components/loading-screen";
import { Suspense } from "react";

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);

  // If already logged in, redirect to dashboard or home
  if (session) {
    redirect(`/user/${session.user.username}/dashboard`);
  }

  return (
    <div>
      <Suspense fallback={<LoadingScreen />}>
        <RegisterClient />
      </Suspense>
    </div>
  );
}
