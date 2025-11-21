"use server";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/db-connect";
import OwnerModel from "@/models/owner";
import sendEmail from "@/utils/nodemailer-utility";

export async function sendPasswordResetEmail(email) {
  try {
    await dbConnect();

    const user = await OwnerModel.findOne({ email });
    if (!user) {
      return { success: false, message: "User not found" };
    }

    if (user.isGoogleAuth) {
      return {
        success: false,
        message:
          "This account was registered with Google. Password reset not applicable.",
      };
    }

    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.RESET_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 3600000);
    await user.save();

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/forgot-password?token=${resetToken}`;

    const subject = "Password Reset Request";
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background-color: #EAB308; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>This link will expire in 1 hour.</p>
      </div>
    `;

    await sendEmail(email, subject, message);

    return { success: true, message: "Reset link sent to email" };
  } catch (error) {
    console.error("Password reset error:", error);
    return { success: false, message: "Failed to send reset email" };
  }
}

export async function resetUserPassword(token, newPassword) {
  try {
    await dbConnect();

    const decoded = jwt.verify(token, process.env.RESET_TOKEN_SECRET);

    const user = await OwnerModel.findOne({
      _id: decoded.userId,
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return { success: false, message: "Invalid or expired reset token" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return { success: true, message: "Password reset successfully" };
  } catch (error) {
    console.error("Reset password error:", error);

    if (error.name === "JsonWebTokenError") {
      return { success: false, message: "Invalid reset token" };
    }
    if (error.name === "TokenExpiredError") {
      return { success: false, message: "Reset token has expired" };
    }

    return { success: false, message: "Password reset failed" };
  }
}
