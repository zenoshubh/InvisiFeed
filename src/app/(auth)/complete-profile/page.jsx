import { redirect } from "next/navigation";
import { getServerSession } from "next-auth"; // Import from your next-auth config
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import ProfileCompletionForm from "./client"; // Client boundary
import LoadingScreen from "@/components/loading-screen";
import { Suspense } from "react";

export default async function CompleteProfilePage() {
  const session = await getServerSession(authOptions);

  // Server-side redirects (faster, no client JS)
  if (!session) {
    redirect("/sign-in");
  }

  if (
    session.user.isProfileCompleted === "completed" ||
    session.user.isProfileCompleted === "skipped"
  ) {
    redirect(`/user/${session.user.username}/generate`);
  }

  // Render client form with session prop (serializable)
  return (
    <div className="flex min-h-screen bg-[#0A0A0A]">
      <Suspense fallback={<LoadingScreen />}>
        <ProfileCompletionForm initialSession={session} />
      </Suspense>
    </div>
  );
}
