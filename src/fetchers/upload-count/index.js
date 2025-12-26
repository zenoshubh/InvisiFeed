"use server";

import dbConnect from "@/lib/db-connect";
import { getAuthenticatedBusiness } from "@/lib/auth/session-utils";
import UsageTrackerModel from "@/models/usage-tracker";
import { checkAndResetDailyUploads, getDailyUploadLimit } from "@/utils/invoice/upload-limit";
import { successResponse, errorResponse } from "@/utils/response";

export async function getUploadCount() {
  await dbConnect();
  try {
    const businessResult = await getAuthenticatedBusiness();
    if (!businessResult.success) {
      return errorResponse(businessResult.message);
    }
    const { business } = businessResult;

    const resetResult = await checkAndResetDailyUploads(business);
    const dailyLimit = getDailyUploadLimit(business);
    
    // Get current count from UsageTracker
    const tracker = await UsageTrackerModel.findOne({
      business: business._id,
      usageType: "invoice-upload",
    }).lean();
    
    const currentCount = tracker?.dailyUploadCount || 0;

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

