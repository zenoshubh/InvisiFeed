import UsageTrackerModel from "@/models/usage-tracker";

/**
 * Check if business has an active Pro plan
 * Validates that plan is 'pro' and end date is in the future
 * @param {object} business - Business document with plan object (from merged session data)
 * @returns {boolean} - True if business has active Pro plan, false otherwise
 * @example
 * if (checkIsProPlan(business)) {
 *   // Allow pro features
 * }
 */
export function checkIsProPlan(business) {
  return (
    business?.plan?.planName === 'pro' &&
    business?.plan?.planEndDate &&
    new Date(business.plan.planEndDate) > new Date()
  );
}

/**
 * Get daily upload limit based on business's plan
 * Returns 10 for Pro plan, 3 for free/trial plans
 * @param {object} business - Business document with plan information (from merged session data)
 * @returns {number} - Daily upload limit (3 for free/trial, 10 for pro)
 * @example
 * const limit = getDailyUploadLimit(business);
 * if (currentCount >= limit) {
 *   // Block upload
 * }
 */
export function getDailyUploadLimit(business) {
  return checkIsProPlan(business) ? 10 : 3;
}

/**
 * Get or create usage tracker for invoice uploads
 * @param {string} businessId - Business ID
 * @returns {Promise<object>} - UsageTracker document
 */
async function getOrCreateUsageTracker(businessId) {
  let tracker = await UsageTrackerModel.findOne({
    business: businessId,
    usageType: "invoice-upload",
  });

  if (!tracker) {
    tracker = await UsageTrackerModel.create({
      business: businessId,
      usageType: "invoice-upload",
      dailyUploadCount: 0,
      lastDailyReset: new Date(),
    });
  }

  return tracker;
}

/**
 * Check and reset daily upload count if 24 hours have passed since last reset
 * Automatically resets the count and updates lastDailyReset timestamp
 * @param {object} business - Business document with _id (from merged session data)
 * @returns {Promise<{hoursSinceLastReset: number, timeLeft: number, wasReset: boolean}>}
 * @example
 * const resetResult = await checkAndResetDailyUploads(business);
 * if (resetResult.wasReset) {
 *   console.log("Upload count was reset");
 * }
 */
export async function checkAndResetDailyUploads(business) {
  const tracker = await getOrCreateUsageTracker(business._id);
  const now = new Date();
  const lastReset = new Date(tracker.lastDailyReset);
  const hoursSinceLastReset = (now - lastReset) / (1000 * 60 * 60);

  let wasReset = false;

  if (hoursSinceLastReset >= 24) {
    tracker.dailyUploadCount = 0;
    tracker.lastDailyReset = now;
    await tracker.save();
    wasReset = true;
  }

  const timeLeft = Math.ceil(24 - hoursSinceLastReset);

  return {
    hoursSinceLastReset,
    timeLeft: timeLeft > 0 ? timeLeft : 0,
    wasReset,
  };
}

/**
 * Check if daily upload limit has been reached
 * Automatically resets count if 24 hours have passed, then checks limit
 * @param {object} business - Business document with _id and plan (from merged session data)
 * @returns {Promise<{success: boolean, message?: string, timeLeft?: number, dailyLimit?: number, currentCount?: number}>}
 * @example
 * const limitCheck = await checkDailyUploadLimit(business);
 * if (!limitCheck.success) {
 *   return errorResponse(limitCheck.message, { timeLeft: limitCheck.timeLeft });
 * }
 */
export async function checkDailyUploadLimit(business) {
  const resetResult = await checkAndResetDailyUploads(business);
  const dailyLimit = getDailyUploadLimit(business);
  
  const tracker = await getOrCreateUsageTracker(business._id);
  const currentCount = tracker.dailyUploadCount;

  if (currentCount >= dailyLimit) {
    const message = checkIsProPlan(business)
      ? `Daily upload limit of ${dailyLimit} reached. Please try again after ${resetResult.timeLeft} hours.`
      : `Daily upload limit of ${dailyLimit} reached. Please try again after ${resetResult.timeLeft} hours. Upgrade to pro plan to increase daily upload limit`;

    return {
      success: false,
      message,
      timeLeft: resetResult.timeLeft,
      dailyLimit,
      currentCount,
    };
  }

  return {
    success: true,
    dailyLimit,
    currentCount,
    timeLeft: resetResult.timeLeft,
  };
}

/**
 * Increment daily upload count and save to database
 * Automatically resets count if 24 hours have passed before incrementing
 * @param {object} business - Business document with _id and plan (from merged session data)
 * @returns {Promise<{dailyUploadCount: number, dailyLimit: number}>}
 * @example
 * const result = await incrementDailyUploadCount(business);
 * console.log(`Upload count: ${result.dailyUploadCount}/${result.dailyLimit}`);
 */
export async function incrementDailyUploadCount(business) {
  await checkAndResetDailyUploads(business);
  
  const tracker = await getOrCreateUsageTracker(business._id);
  tracker.dailyUploadCount += 1;
  await tracker.save();

  return {
    dailyUploadCount: tracker.dailyUploadCount,
    dailyLimit: getDailyUploadLimit(business),
  };
}

