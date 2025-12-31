"use server";

import dbConnect from "@/lib/db-connect";
import AccountModel from "@/models/account";

export async function verifyCode(username, code) {
  await dbConnect();

  try {
    const decodedUsername = decodeURIComponent(username);
    const account = await AccountModel.findOne({ username: decodedUsername }).lean();

    if (!account) {
      return { success: false, message: "Account not found" };
    }

    const isCodeValid = account.verifyCode === code;
    const isCodeNotExpired = new Date(account.verifyCodeExpiry) > new Date();

    if (isCodeValid && isCodeNotExpired) {
      await AccountModel.findByIdAndUpdate(account._id, {
        isVerified: true,
      });
      return {
        success: true,
        message: "Account verified successfully",
      };
    } else if (!isCodeNotExpired) {
      return {
        success: false,
        message:
          "Verification code has expired, please sign up again to get a new code",
      };
    } else {
      return {
        success: false,
        message: "Incorrect Verification code",
      };
    }
  } catch (error) {
    console.error("Error verifying account:", error);
    return { success: false, message: "Error verifying account" };
  }
}

