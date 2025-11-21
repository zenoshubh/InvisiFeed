import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getUploadCount } from "@/actions/invoice-actions";
import InvoiceManagementContainer from "@/components/invoice-management/invoice-management-container";

export default async function InvoiceManagementPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/sign-in");
  }

  // Fetch initial upload count
  const uploadCountResponse = await getUploadCount();

  const initialData = {
    dailyUploadCount: uploadCountResponse?.data?.dailyUploadCount || 0,
    dailyLimit: uploadCountResponse?.data?.dailyLimit || 3,
    owner: session.user,
  };

  return <InvoiceManagementContainer initialData={initialData} />;
}
