import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import OwnerModel from "@/models/owner";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    await dbConnect();
    const { token, password } = await request.json();

    // Verify token
    const decoded = jwt.verify(token, process.env.RESET_TOKEN_SECRET);

    // Find user with valid reset token
    const user = await OwnerModel.findOne({
      _id: decoded.userId,
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return NextResponse.json(
      { success: true, message: "Password reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json(
        { success: false, message: "Invalid reset token" },
        { status: 400 }
      );
    }
    if (error.name === "TokenExpiredError") {
      return NextResponse.json(
        { success: false, message: "Reset token has expired" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
} 