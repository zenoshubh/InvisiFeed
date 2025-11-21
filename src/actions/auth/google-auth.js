"use server";

import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/models/Owner";
import DeletedAccountModel from "@/models/DeletedAccount";
import { deleteOldInvoicePdfs } from "@/utils/deleteOldInvoicesFromCloudinary";

export async function handleGoogleSignIn(user, profile) {
  try {
    await dbConnect();

    const existingUser = await OwnerModel.findOne({ email: user.email }).lean();

    if (existingUser) {
      // Check if user originally signed up with credentials
      if (!existingUser.isGoogleAuth) {
        return {
          success: false,
          redirectUrl: "/sign-in?error=DIFFERENT_SIGNIN_METHOD",
        };
      }

      // Background cleanup
      deleteOldInvoicePdfs(existingUser.username).catch(console.error);

      return {
        success: true,
        user: {
          ...existingUser,
          id: existingUser._id.toString(),
        },
      };
    }

    // Check deleted accounts
    const deletedAccount = await DeletedAccountModel.findOne({
      email: user.email,
    });
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

    // Create new user
    const username = await generateUniqueUsername(user.email);

    const newUser = await OwnerModel.create({
      email: user.email,
      businessName: user.name || "",
      username,
      password: await bcrypt.hash(Math.random().toString(36), 10),
      verifyCode: "GOOGLE_AUTH",
      verifyCodeExpiry: new Date(),
      isVerified: true,
      isGoogleAuth: true,
      isProfileCompleted: "pending",
      phoneNumber: "",
      address: {
        localAddress: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
      },
      gstinDetails: {
        gstinVerificationStatus: false,
        gstinNumber: "",
        gstinVerificationResponse: null,
      },
    });

    return {
      success: true,
      user: {
        ...newUser.toObject(),
        id: newUser._id.toString(),
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

  while (await OwnerModel.findOne({ username }).lean()) {
    username = `${baseUsername}${counter}`;
    counter++;
  }

  return username;
}
