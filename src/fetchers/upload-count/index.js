"use server";

import dbConnect from "@/lib/db-connect";
import { getAuthenticatedOwnerDocument } from "@/lib/auth/session-utils";
import { checkAndResetDailyUploads, getDailyUploadLimit } from "@/utils/invoice/upload-limit";
import { successResponse, errorResponse } from "@/utils/response";

export async function getUploadCount() {
  await dbConnect();
  try {
    const ownerResult = await getAuthenticatedOwnerDocument();
    if (!ownerResult.success) {
      return errorResponse(ownerResult.message);
    }
    const { owner } = ownerResult;

    const resetResult = await checkAndResetDailyUploads(owner);
    const dailyLimit = getDailyUploadLimit(owner);
    const currentCount = owner.uploadedInvoiceCount.dailyUploadCount;

    // Calculate time left if limit is reached
    let timeLeft = null;
    if (currentCount >= dailyLimit) {
      timeLeft = resetResult.timeLeft;
    }

    return successResponse("Upload count fetched successfully", {
      dailyUploadCount: currentCount,
      timeLeft,
      dailyLimit,
    });
  } catch (error) {
    console.error("Error fetching upload count:", error);
    return errorResponse("Internal server error");
  }
}

