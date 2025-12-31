import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import LoadingScreen from "@/components/common/loading-screen";
import { Suspense } from "react";

export default async function UserLayout({ children, params }) {
  const session = await getServerSession(authOptions);
  const { username } = await params;

  // Check authentication
  if (!session || !session.user) {
    redirect("/sign-in");
  }

  // Check username matching
  if (session.user.username !== username) {
    redirect(`/user/${session.user.username}/generate`);
  }

  // Check profile completion status
  if (session.user.isProfileCompleted === "pending") {
    redirect("/complete-profile");
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      {children}
    </Suspense>
  );
}

