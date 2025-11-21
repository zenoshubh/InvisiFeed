import dbConnect from "@/lib/db-connect";
import OwnerModel from "@/models/owner";
import { NextResponse } from "next/server";

export async function POST(request) {
  await dbConnect();

  try {
    const { username, code } = await request.json();

    const decodedUsername = decodeURIComponent(username);
    const owner = await OwnerModel.findOne({ username: decodedUsername });

    if (!owner) {
      return NextResponse.json(
        { success: false, message: "Owner not found" },
        { status: 404 }
      );
    }

    const isCodeValid = owner.verifyCode === code;
    const isCodeNotExpired = new Date(owner.verifyCodeExpiry) > new Date();

    if (isCodeValid && isCodeNotExpired) {
      owner.isVerified = true;
      await owner.save();
      return NextResponse.json(
        {
          success: true,
          message: "Account verified successfully",
        },
        { status: 200 }
      );
    } else if (!isCodeNotExpired) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Verification code has expired, please sign up again to get a new code",
        },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Incorrect Verification code",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error verifying owner:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error verifying owner",
      },
      { status: 500 }
    );
  }
}
