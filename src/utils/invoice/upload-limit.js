/**
 * Check if owner has an active Pro plan
 * Validates that plan is 'pro' and end date is in the future
 * @param {object} owner - Owner document with plan object
 * @returns {boolean} - True if owner has active Pro plan, false otherwise
 * @example
 * if (checkIsProPlan(owner)) {
 *   // Allow pro features
 * }
 */
export function checkIsProPlan(owner) {
  return (
    owner?.plan?.planName === 'pro' &&
    owner?.plan?.planEndDate &&
    new Date(owner.plan.planEndDate) > new Date()
  );
}

/**
 * Get daily upload limit based on owner's plan
 * Returns 10 for Pro plan, 3 for free/trial plans
 * @param {object} owner - Owner document with plan information
 * @returns {number} - Daily upload limit (3 for free/trial, 10 for pro)
 * @example
 * const limit = getDailyUploadLimit(owner);
 * if (currentCount >= limit) {
 *   // Block upload
 * }
 */
export function getDailyUploadLimit(owner) {
  return checkIsProPlan(owner) ? 10 : 3;
}

/**
 * Check and reset daily upload count if 24 hours have passed since last reset
 * Automatically resets the count and updates lastDailyReset timestamp
 * @param {object} owner - Owner Mongoose document (must be a document, not lean query result)
 * @returns {Promise<{hoursSinceLastReset: number, timeLeft: number, wasReset: boolean}>}
 * @example
 * const resetResult = await checkAndResetDailyUploads(owner);
 * if (resetResult.wasReset) {
 *   console.log("Upload count was reset");
 * }
 */
export async function checkAndResetDailyUploads(owner) {
  const now = new Date();
  const lastReset = new Date(owner.uploadedInvoiceCount.lastDailyReset);
  const hoursSinceLastReset = (now - lastReset) / (1000 * 60 * 60);

  let wasReset = false;

  if (hoursSinceLastReset >= 24) {
    owner.uploadedInvoiceCount.dailyUploadCount = 0;
    owner.uploadedInvoiceCount.lastDailyReset = now;
    await owner.save();
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
 * @param {object} owner - Owner Mongoose document (must be a document, not lean query result)
 * @returns {Promise<{success: boolean, message?: string, timeLeft?: number, dailyLimit?: number, currentCount?: number}>}
 * @example
 * const limitCheck = await checkDailyUploadLimit(owner);
 * if (!limitCheck.success) {
 *   return errorResponse(limitCheck.message, { timeLeft: limitCheck.timeLeft });
 * }
 */
export async function checkDailyUploadLimit(owner) {
  const resetResult = await checkAndResetDailyUploads(owner);
  const dailyLimit = getDailyUploadLimit(owner);
  const currentCount = owner.uploadedInvoiceCount.dailyUploadCount;

  if (currentCount >= dailyLimit) {
    const message = checkIsProPlan(owner)
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
 * @param {object} owner - Owner Mongoose document (must be a document, not lean query result)
 * @returns {Promise<{dailyUploadCount: number, dailyLimit: number}>}
 * @example
 * const result = await incrementDailyUploadCount(owner);
 * console.log(`Upload count: ${result.dailyUploadCount}/${result.dailyLimit}`);
 */
export async function incrementDailyUploadCount(owner) {
  await checkAndResetDailyUploads(owner);
  owner.uploadedInvoiceCount.dailyUploadCount += 1;
  await owner.save();

  return {
    dailyUploadCount: owner.uploadedInvoiceCount.dailyUploadCount,
    dailyLimit: getDailyUploadLimit(owner),
  };
}

