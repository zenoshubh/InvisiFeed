"use server";

import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db-connect";
import AccountModel from "@/models/account";
import BusinessModel from "@/models/business";
import SubscriptionModel from "@/models/subscription";
import DeletedAccountModel from "@/models/deleted-account";
import sendVerificationEmail from "@/utils/email/send-verification-email";
import { generateOTP } from "@/utils/common/generate-otp";

// ✅ Fix: Add prevState parameter for useActionState
export async function registerUser(prevState, formData) {
  try {
    console.log(formData);
    const businessName = formData.get("businessName");
    const email = formData.get("email");
    const username = formData.get("username");
    const password = formData.get("password");

    await dbConnect();

    // Check deleted accounts - only fetch deletionDate
    const deletedAccount = await DeletedAccountModel.findOne({ email })
      .select('_id deletionDate')
      .lean();
    if (deletedAccount?.deletionDate) {
      const timeElapsed =
        new Date().getTime() - deletedAccount.deletionDate.getTime();
      const fifteenDays = 15 * 24 * 60 * 60 * 1000;

      if (timeElapsed < fifteenDays) {
        const remainingDays = Math.ceil(
          (fifteenDays - timeElapsed) / (24 * 60 * 60 * 1000)
        );
        return {
          success: false,
          message: `Account was deleted. Try again after ${remainingDays} days`,
          data: null,
        };
      } else {
        await DeletedAccountModel.findByIdAndDelete(deletedAccount._id);
      }
    }

    // Check existing accounts - only fetch _id
    const existingVerifiedAccount = await AccountModel.findOne({
      username,
      isVerified: true,
    })
      .select('_id')
      .lean();

    if (existingVerifiedAccount) {
      return { success: false, message: "Username already exists", data: null };
    }

    const existingEmailAccount = await AccountModel.findOne({ email })
      .select('_id isVerified')
      .lean();
    const verifyCode = generateOTP();
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingEmailAccount) {
      if (existingEmailAccount.isVerified) {
        return { success: false, message: "Email already exists", data: null };
      }

      // Update existing unverified account
      await AccountModel.findByIdAndUpdate(existingEmailAccount._id, {
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: new Date(Date.now() + 3600000),
        username,
      });

      // Update business if exists - fetch document for saving
      const existingBusiness = await BusinessModel.findOne({
        account: existingEmailAccount._id,
      })
        .select('_id businessName');
      if (existingBusiness) {
        existingBusiness.businessName = businessName;
        await existingBusiness.save();
      }
    } else {
      // Create new account
      const newAccount = await AccountModel.create({
        email,
        username,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: new Date(Date.now() + 3600000),
        isVerified: false,
        isGoogleAuth: false,
      });

      // Create business for the account
      const newBusiness = await BusinessModel.create({
        account: newAccount._id,
        businessName,
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
      });

      // Create free subscription
      await SubscriptionModel.create({
        business: newBusiness._id,
        planType: "free",
        status: "active",
        startDate: new Date(),
        endDate: null,
      });
    }

    const emailResponse = await sendVerificationEmail(email, verifyCode);

    if (!emailResponse.success) {
      return { success: false, message: emailResponse.message, data: null };
    }

    return {
      success: true,
      message: "User registered successfully. Please verify your email.",
      data: {
        username: username, // ✅ Add username for redirect
      },
    };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, message: "Registration failed", data: null };
  }
}

export async function verifyUserAccount(username, code) {
  try {
    await dbConnect();

    const decodedUsername = decodeURIComponent(username);
    const account = await AccountModel.findOne({ username: decodedUsername })
      .select('_id username verifyCode verifyCodeExpiry')
      .lean();

    if (!account) {
      return { success: false, message: "User not found", data: null };
    }

    const isCodeValid = account.verifyCode === code;
    const isCodeNotExpired = new Date(account.verifyCodeExpiry) > new Date();

    if (isCodeValid && isCodeNotExpired) {
      await AccountModel.findByIdAndUpdate(account._id, {
        isVerified: true,
      });
      return { success: true, message: "Account verified successfully", data: null };
    } else if (!isCodeNotExpired) {
      return {
        success: false,
        message: "Verification code has expired, please sign up again",
        data: null,
      };
    } else {
      return { success: false, message: "Incorrect verification code", data: null };
    }
  } catch (error) {
    console.error("Verification error:", error);
    return { success: false, message: "Verification failed", data: null };
  }
}

export async function checkUsernameAvailability(username) {
  try {
    if (!username) {
      return { success: true, message: "" };
    }

    await dbConnect();

    const existingAccount = await AccountModel.findOne({
      username: username.toLowerCase(),
      isVerified: true,
    })
      .select('_id')
      .lean();

    if (existingAccount) {
      return {
        success: false,
        message: "Username already taken",
        data: null,
      };
    }

    return {
      success: true,
      message: "Username available",
      data: { available: true },
    };
  } catch (error) {
    console.error("Username check error:", error);
    return {
      success: false,
      message: "Error checking username",
      data: null,
    };
  }
}
