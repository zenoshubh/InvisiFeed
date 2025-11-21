"use server";

import dbConnect from "@/lib/db-connect";
import OwnerModel from "@/models/owner";
import jwt from "jsonwebtoken";
import sendEmail from "@/utils/email/nodemailer-utility";

export async function forgotPassword(email) {
  try {
    await dbConnect();

    // Find user by email
    const user = await OwnerModel.findOne({ email });
    if (!user) {
      return { success: false, message: "User not found" };
    }

    if (user.isGoogleAuth) {
      return {
        success: false,
        message:
          "This account was registered with Google Sign-In. Password reset is not applicable.",
      };
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.RESET_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    // Store reset token in user document
    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour expiry
    await user.save();

    // Create reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/forgot-password?token=${resetToken}`;

    // Send reset email
    const subject = "Password Reset Request";
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password for your InvisiFeed account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background-color: #EAB308; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
        <p>Best regards,<br>The InvisiFeed Team</p>
      </div>
    `;

    await sendEmail(email, subject, message);

    return { success: true, message: "Reset link sent to email" };
  } catch (error) {
    console.error("Forgot password error:", error);
    return { success: false, message: "Internal server error" };
  }
}

export async function resetPassword(token, password) {
  try {
    await dbConnect();

    // Verify token
    const decoded = jwt.verify(token, process.env.RESET_TOKEN_SECRET);

    // Find user with valid reset token
    const user = await OwnerModel.findOne({
      _id: decoded.userId,
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return { success: false, message: "Invalid or expired reset token" };
    }

    const bcrypt = await import("bcryptjs");
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token
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
    return { success: false, message: "Internal server error" };
  }
}

