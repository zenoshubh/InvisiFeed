import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/options";
import { getUploadCount } from "@/actions/invoice";
import InvoiceManagementContainer from "@/components/invoice-management/invoice-management-container";

export default async function InvoiceManagementPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/sign-in");
  }

  // Fetch initial upload count
  const uploadCountResponse = await getUploadCount();

  // Serialize business/user data for client component (remove non-serializable data)
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

  const initialData = {
    dailyUploadCount: uploadCountResponse?.data?.dailyUploadCount || 0,
    dailyLimit: uploadCountResponse?.data?.dailyLimit || 3,
    business: serializedBusiness,
  };

  return <InvoiceManagementContainer initialData={initialData} />;
}
