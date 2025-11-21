import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import OwnerModel from "@/models/owner";
import jwt from "jsonwebtoken";
import sendEmail from "@/utils/nodemailer-utility";

export async function POST(request) {
  try {
    await dbConnect();
    const { email } = await request.json();

    // Find user by email
    const user = await OwnerModel.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (user.isGoogleAuth) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This account was registered with Google Sign-In. Password reset is not applicable.",
        },
        { status: 400 }
      );
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

    return NextResponse.json(
      { success: true, message: "Reset link sent to email" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
