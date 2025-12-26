'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import AccountModel from '@/models/account';
import BusinessModel from '@/models/business';
import SubscriptionModel from '@/models/subscription';

/**
 * Get authenticated session from NextAuth
 * Validates that a user session exists and has a username
 * @returns {Promise<{success: boolean, session?: object, username?: string, message?: string}>}
 * @example
 * const sessionResult = await getAuthenticatedSession();
 * if (!sessionResult.success) {
 *   return errorResponse(sessionResult.message);
 * }
 * const { session, username } = sessionResult;
 */
export async function getAuthenticatedSession() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return { success: false, message: 'Unauthorized' };
    }

    const username = session.user.username;

    if (!username) {
      return { success: false, message: 'Username not found in session' };
    }

    return {
      success: true,
      session,
      username,
    };
  } catch (error) {
    console.error('Error getting authenticated session:', error);
    return { success: false, message: 'Failed to authenticate' };
  }
}

/**
 * Get authenticated business from session (lean query - read-only)
 * Merges Account + Business + Subscription data for backward compatibility
 * Use this when you only need to read business data and don't need Mongoose document methods
 * @returns {Promise<{success: boolean, business?: object, account?: object, subscription?: object, session?: object, username?: string, message?: string}>}
 * @example
 * const businessResult = await getAuthenticatedBusiness();
 * if (!businessResult.success) {
 *   return errorResponse(businessResult.message);
 * }
 * const { business, account, subscription, username } = businessResult;
 */
export async function getAuthenticatedBusiness() {
  try {
    const sessionResult = await getAuthenticatedSession();

    if (!sessionResult.success) {
      return sessionResult;
    }

    // Find account by username
    const account = await AccountModel.findOne({
      username: sessionResult.username,
    }).lean();

    if (!account) {
      return { success: false, message: 'Account not found' };
    }

    // Find business by account
    const business = await BusinessModel.findOne({
      account: account._id,
    }).lean();

    if (!business) {
      return { success: false, message: 'Business not found' };
    }

    // Find active subscription
    const subscription = await SubscriptionModel.findOne({
      business: business._id,
      status: 'active',
    })
      .sort({ createdAt: -1 })
      .lean();

    // Merge data for backward compatibility (business-like object)
    const mergedBusiness = {
      ...business,
      ...account,
      _id: business._id,
      accountId: account._id,
      businessId: business._id,
      // Plan info from subscription (for backward compatibility)
      plan: subscription
        ? {
            planName: subscription.planType,
            planStartDate: subscription.startDate,
            planEndDate: subscription.endDate,
          }
        : {
            planName: 'free',
            planStartDate: null,
            planEndDate: null,
          },
      subscription: subscription || null,
    };

    return {
      success: true,
      business: mergedBusiness,
      account,
      businessData: business,
      subscription,
      session: sessionResult.session,
      username: sessionResult.username,
    };
  } catch (error) {
    console.error('Error getting authenticated business:', error);
    return { success: false, message: 'Failed to fetch business information' };
  }
}

/**
 * Get authenticated business with document methods (not lean)
 * Use this when you need to save/update the business document
 * @returns {Promise<{success: boolean, business?: object, account?: object, subscription?: object, session?: object, username?: string, message?: string}>}
 * @example
 * const businessResult = await getAuthenticatedBusinessDocument();
 * if (!businessResult.success) {
 *   return errorResponse(businessResult.message);
 * }
 * const { business } = businessResult;
 * business.someField = 'new value';
 * await business.save();
 */
export async function getAuthenticatedBusinessDocument() {
  try {
    const sessionResult = await getAuthenticatedSession();

    if (!sessionResult.success) {
      return sessionResult;
    }

    // Find account by username
    const account = await AccountModel.findOne({
      username: sessionResult.username,
    }).lean();

    if (!account) {
      return { success: false, message: 'Account not found' };
    }

    // Find business by account (as document for saving)
    const business = await BusinessModel.findOne({
      account: account._id,
    });

    if (!business) {
      return { success: false, message: 'Business not found' };
    }

    // Find active subscription
    const subscription = await SubscriptionModel.findOne({
      business: business._id,
      status: 'active',
    })
      .sort({ createdAt: -1 })
      .lean();

    // Merge data for backward compatibility
    const mergedBusiness = {
      ...business.toObject(),
      ...account,
      _id: business._id,
      accountId: account._id,
      businessId: business._id,
      // Plan info from subscription
      plan: subscription
        ? {
            planName: subscription.planType,
            planStartDate: subscription.startDate,
            planEndDate: subscription.endDate,
          }
        : {
            planName: 'free',
            planStartDate: null,
            planEndDate: null,
          },
      subscription: subscription || null,
    };

    // Attach merged data to business document for backward compatibility
    Object.assign(business, mergedBusiness);

    return {
      success: true,
      business,
      account,
      businessData: business,
      subscription,
      session: sessionResult.session,
      username: sessionResult.username,
    };
  } catch (error) {
    console.error('Error getting authenticated business document:', error);
    return { success: false, message: 'Failed to fetch business information' };
  }
}


