"use server";

import dbConnect from "@/lib/db-connect";
import OwnerModel from "@/models/owner";

export async function verifyCode(username, code) {
  await dbConnect();

  try {
    const decodedUsername = decodeURIComponent(username);
    const owner = await OwnerModel.findOne({ username: decodedUsername });

    if (!owner) {
      return { success: false, message: "Owner not found" };
    }

    const isCodeValid = owner.verifyCode === code;
    const isCodeNotExpired = new Date(owner.verifyCodeExpiry) > new Date();

    if (isCodeValid && isCodeNotExpired) {
      owner.isVerified = true;
      await owner.save();
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
    console.error("Error verifying owner:", error);
    return { success: false, message: "Error verifying owner" };
  }
}

