"use server";

import sendInvoiceToMail from "@/utils/send-invoice-to-mail";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function sendInvoiceEmail({
  customerEmail,
  invoiceNumber,
  pdfUrl,
  companyName,
  feedbackUrl,
}) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return { success: false, message: "Unauthorized" };
    }

    if (!customerEmail || !invoiceNumber || !pdfUrl || !feedbackUrl) {
      return { success: false, message: "Missing required fields" };
    }

    const result = await sendInvoiceToMail(
      customerEmail,
      invoiceNumber,
      pdfUrl,
      companyName,
      feedbackUrl
    );

    if (result.success) {
      return {
        success: true,
        message: "Email sent successfully",
      };
    } else {
      return {
        success: false,
        message: result.error || "Failed to send email",
      };
    }
  } catch (error) {
    console.error("Error in send-invoice-email:", error);
    return { success: false, message: "Internal server error" };
  }
}

