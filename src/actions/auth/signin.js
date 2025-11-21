"use server";

import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/models/Owner";
import { deleteOldInvoicePdfs } from "@/utils/deleteOldInvoicesFromCloudinary";
import sendVerificationEmail from "@/utils/sendVerificationEmail";

export async function signInUser(identifier, password) {
  try {
    await dbConnect();

    const user = await OwnerModel.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).lean(); // Use lean for better performance

    if (!user) {
      return {
        success: false,
        message: "User not found with this email or username",
      };
    }

    if (user.isGoogleAuth) {
      return {
        success: false,
        message: "You have signed up with Google. Please sign in using Google.",
      };
    }

    if (!user.isVerified) {
      const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

      await OwnerModel.findByIdAndUpdate(user._id, {
        verifyCode,
        verifyCodeExpiry: new Date(Date.now() + 3600000),
      });

      const emailResponse = await sendVerificationEmail(user.email, verifyCode);

      if (!emailResponse.success) {
        return { success: false, message: emailResponse.message };
      }

      return {
        success: false,
        message: `UNVERIFIED_USER:${user.username}`,
      };
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return { success: false, message: "Incorrect password" };
    }

    // Background task - don't await
    deleteOldInvoicePdfs(user.username).catch(console.error);

    return {
      success: true,
      user: {
        ...user,
        id: user._id.toString(),
      },
    };
  } catch (error) {
    console.error("Sign in error:", error);
    return { success: false, message: "Sign in failed" };
  }
}
