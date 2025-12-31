"use server";

import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db-connect";
import AccountModel from "@/models/account";
import BusinessModel from "@/models/business";
import SubscriptionModel from "@/models/subscription";
import { deleteOldInvoicePdfs } from "@/utils/invoice/delete-old-invoices";
import sendVerificationEmail from "@/utils/email/send-verification-email";
import { generateOTP } from "@/utils/common/generate-otp";

export async function signInUser(identifier, password) {
  try {
    await dbConnect();

    // Find account by email or username - only fetch needed fields
    const account = await AccountModel.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    })
      .select('_id email username password isGoogleAuth isVerified verifyCode verifyCodeExpiry')
      .lean();

    if (!account) {
      return {
        success: false,
        message: "User not found with this email or username",
      };
    }

    if (account.isGoogleAuth) {
      return {
        success: false,
        message: "You have signed up with Google. Please sign in using Google.",
      };
    }

    if (!account.isVerified) {
      const verifyCode = generateOTP();

      await AccountModel.findByIdAndUpdate(account._id, {
        verifyCode,
        verifyCodeExpiry: new Date(Date.now() + 3600000),
      });

      const emailResponse = await sendVerificationEmail(account.email, verifyCode);

      if (!emailResponse.success) {
        return { success: false, message: emailResponse.message };
      }

      return {
        success: false,
        message: `UNVERIFIED_USER:${account.username}`,
      };
    }

    const isPasswordCorrect = await bcrypt.compare(password, account.password);

    if (!isPasswordCorrect) {
      return { success: false, message: "Incorrect password" };
    }

    // Get business and subscription data - only fetch needed fields
    const business = await BusinessModel.findOne({
      account: account._id,
    })
      .select('_id account businessName phoneNumber address isProfileCompleted gstinDetails proTrialUsed createdAt updatedAt')
      .lean();

    const subscription = await SubscriptionModel.findOne({
      business: business?._id,
      status: "active",
    })
      .select('planType startDate endDate status business')
      .sort({ createdAt: -1 })
      .lean();

    // Merge data for backward compatibility
    const user = {
      ...account,
      ...business,
      _id: business?._id || account._id,
      plan: subscription
        ? {
            planName: subscription.planType,
            planStartDate: subscription.startDate,
            planEndDate: subscription.endDate,
          }
        : {
            planName: "free",
            planStartDate: null,
            planEndDate: null,
          },
      proTrialUsed: business?.proTrialUsed || false,
    };

    // Background task - don't await
    deleteOldInvoicePdfs(account.username).catch(console.error);

    return {
      success: true,
      message: "Sign in successful",
      data: {
        user: {
          ...user,
          id: business?._id?.toString() || account._id.toString(),
        },
      },
    };
  } catch (error) {
    console.error("Sign in error:", error);
    return { success: false, message: "Sign in failed" };
  }
}
