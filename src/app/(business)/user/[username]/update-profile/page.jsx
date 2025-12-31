import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import UpdateProfileClient from "./client";
import LoadingScreen from "@/components/common/loading-screen";
import { Suspense } from "react";

export default async function UpdateProfilePage({ params }) {
  const session = await getServerSession(authOptions);
  const { username } = await params;

  // Server-side redirects (faster, no client JS)
  if (!session) {
    redirect("/sign-in");
  }

  // Validate username matches session
  if (session.user.username !== username) {
    redirect(`/user/${session.user.username}/update-profile`);
  }

  // Serialize business data for client component (remove non-serializable data)
  const serializedBusiness = {
    id: typeof session.user.id === 'object' ? session.user.id.toString() : session.user.id,
    email: session.user.email,
    username: session.user.username,
    businessName: session.user.businessName || null,
    phoneNumber: session.user.phoneNumber || null,
    address: session.user.address ? {
      localAddress: session.user.address.localAddress || null,
      city: session.user.address.city || null,
      state: session.user.address.state || null,
      country: session.user.address.country || null,
      pincode: session.user.address.pincode || null,
    } : null,
    isProfileCompleted: session.user.isProfileCompleted || null,
    gstinDetails: session.user.gstinDetails ? {
      gstinVerificationStatus: session.user.gstinDetails.gstinVerificationStatus || false,
      gstinNumber: session.user.gstinDetails.gstinNumber || null,
      gstinHolderName: session.user.gstinDetails.gstinHolderName || null,
    } : null,
    plan: session.user.plan ? {
      planName: session.user.plan.planName || null,
      planStartDate: session.user.plan.planStartDate ? new Date(session.user.plan.planStartDate).toISOString() : null,
      planEndDate: session.user.plan.planEndDate ? new Date(session.user.plan.planEndDate).toISOString() : null,
    } : null,
    proTrialUsed: session.user.proTrialUsed || false,
  };

  // Render client component with serialized business data
  return (
    <Suspense fallback={<LoadingScreen />}>
      <UpdateProfileClient initialBusiness={serializedBusiness} />
    </Suspense>
  );
}
