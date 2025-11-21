'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import OwnerModel from '@/models/owner';

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
 * Get authenticated owner from session (lean query - read-only)
 * Use this when you only need to read owner data and don't need Mongoose document methods
 * @returns {Promise<{success: boolean, owner?: object, session?: object, username?: string, message?: string}>}
 * @example
 * const ownerResult = await getAuthenticatedOwner();
 * if (!ownerResult.success) {
 *   return errorResponse(ownerResult.message);
 * }
 * const { owner, username } = ownerResult;
 */
export async function getAuthenticatedOwner() {
  try {
    const sessionResult = await getAuthenticatedSession();

    if (!sessionResult.success) {
      return sessionResult;
    }

    const owner = await OwnerModel.findOne({
      username: sessionResult.username,
    }).lean();

    if (!owner) {
      return { success: false, message: 'Business not found' };
    }

    return {
      success: true,
      owner,
      session: sessionResult.session,
      username: sessionResult.username,
    };
  } catch (error) {
    console.error('Error getting authenticated owner:', error);
    return { success: false, message: 'Failed to fetch business information' };
  }
}

/**
 * Get authenticated owner with document methods (not lean)
 * Use this when you need to save/update the owner document
 * @returns {Promise<{success: boolean, owner?: object, session?: object, username?: string, message?: string}>}
 * @example
 * const ownerResult = await getAuthenticatedOwnerDocument();
 * if (!ownerResult.success) {
 *   return errorResponse(ownerResult.message);
 * }
 * const { owner } = ownerResult;
 * owner.someField = 'new value';
 * await owner.save();
 */
export async function getAuthenticatedOwnerDocument() {
  try {
    const sessionResult = await getAuthenticatedSession();

    if (!sessionResult.success) {
      return sessionResult;
    }

    const owner = await OwnerModel.findOne({
      username: sessionResult.username,
    });

    if (!owner) {
      return { success: false, message: 'Business not found' };
    }

    return {
      success: true,
      owner,
      session: sessionResult.session,
      username: sessionResult.username,
    };
  } catch (error) {
    console.error('Error getting authenticated owner document:', error);
    return { success: false, message: 'Failed to fetch business information' };
  }
}

