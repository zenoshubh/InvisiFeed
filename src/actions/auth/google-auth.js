"use server";

import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db-connect";
import AccountModel from "@/models/account";
import BusinessModel from "@/models/business";
import SubscriptionModel from "@/models/subscription";
import DeletedAccountModel from "@/models/deleted-account";
import { deleteOldInvoicePdfs } from "@/utils/invoice/delete-old-invoices";

export async function handleGoogleSignIn(user, profile) {
  try {
    await dbConnect();

    // Find account by email - fetch fields needed for response
    const existingAccount = await AccountModel.findOne({
      email: user.email,
    })
      .select('_id email username isGoogleAuth')
      .lean();

    if (existingAccount) {
      // Check if user originally signed up with credentials
      if (!existingAccount.isGoogleAuth) {
        return {
          success: false,
          redirectUrl: "/sign-in?error=DIFFERENT_SIGNIN_METHOD",
        };
      }

      // Get business data - fetch fields needed for response
      const business = await BusinessModel.findOne({
        account: existingAccount._id,
      })
        .select('_id account businessName phoneNumber address isProfileCompleted gstinDetails proTrialUsed')
        .lean();

      const subscription = await SubscriptionModel.findOne({
        business: business?._id,
        status: "active",
      })
        .select('planType startDate endDate status business')
        .sort({ createdAt: -1 })
        .lean();

      // Merge data for backward compatibility
      const mergedUser = {
        ...existingAccount,
        ...business,
        _id: business?._id || existingAccount._id,
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

      // Background cleanup
      deleteOldInvoicePdfs(existingAccount.username).catch(console.error);

      return {
        success: true,
        user: {
          ...mergedUser,
          id: business?._id?.toString() || existingAccount._id.toString(),
        },
      };
    }

    // Check deleted accounts - only fetch deletionDate
    const deletedAccount = await DeletedAccountModel.findOne({
      email: user.email,
    })
      .select('_id deletionDate')
      .lean();
    if (deletedAccount?.deletionDate) {
      const timeDiff = Date.now() - deletedAccount.deletionDate.getTime();
      const fifteenDays = 15 * 24 * 60 * 60 * 1000;

      if (timeDiff < fifteenDays) {
        const remainingDays = Math.ceil(
          (fifteenDays - timeDiff) / (24 * 60 * 60 * 1000)
        );
        return {
          success: false,
          redirectUrl: `/sign-in?error=ACCOUNT_DELETED&remainingDays=${remainingDays}`,
        };
      } else {
        await DeletedAccountModel.findByIdAndDelete(deletedAccount._id);
      }
    }

    // Create new account
    const username = await generateUniqueUsername(user.email);

    const newAccount = await AccountModel.create({
      email: user.email,
      username,
      password: await bcrypt.hash(Math.random().toString(36), 10),
      verifyCode: "GOOGLE_AUTH",
      verifyCodeExpiry: new Date(),
      isVerified: true,
      isGoogleAuth: true,
    });

    // Create business for the account
    const newBusiness = await BusinessModel.create({
      account: newAccount._id,
      businessName: user.name || "",
      phoneNumber: "",
      address: {
        localAddress: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
      },
      isProfileCompleted: "pending",
      proTrialUsed: false,
      gstinDetails: {
        gstinVerificationStatus: false,
        gstinNumber: "",
        gstinHolderName: "",
      },
    });

    // Create free subscription
    await SubscriptionModel.create({
      business: newBusiness._id,
      planType: "free",
      status: "active",
      startDate: new Date(),
      endDate: null,
    });

    // Merge data for response
    const mergedUser = {
      ...newAccount.toObject(),
      ...newBusiness.toObject(),
      _id: newBusiness._id,
      plan: {
        planName: "free",
        planStartDate: null,
        planEndDate: null,
      },
      proTrialUsed: false,
    };

    return {
      success: true,
      message: "Google sign-in successful",
      data: {
        user: {
          ...mergedUser,
          id: newBusiness._id.toString(),
        },
      },
    };
  } catch (error) {
    console.error("Google sign-in error:", error);
    return { success: false, redirectUrl: "/sign-in?error=GoogleSignInError" };
  }
}

async function generateUniqueUsername(email) {
  const baseUsername = email.split("@")[0];
  let username = baseUsername;
  let counter = 1;

  while (await AccountModel.findOne({ username })
    .select('_id')
    .lean()) {
    username = `${baseUsername}${counter}`;
    counter++;
  }

  return username;
}
