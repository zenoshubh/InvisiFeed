import sendVerificationEmail from "@/utils/send-verification-email";
import dbConnect from "@/lib/db-connect";
import OwnerModel from "@/models/owner";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import DeletedAccountModel from "@/models/deleted-account";

export async function POST(req) {
  await dbConnect();

  try {
    const { businessName, email, username, password } = await req.json();

    const deletedAccount = await DeletedAccountModel.findOne({ email });



    if (
      deletedAccount &&
      deletedAccount.deletionDate &&
      (deletedAccount.deletionDate.getTime() + 15 * 24 * 60 * 60 * 1000) > new Date().getTime()
    ) {
      const remainingMs = deletedAccount.deletionDate.getTime() + (15 * 24 * 60 * 60 * 1000) - new Date().getTime();
      const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
    
      return NextResponse.json(
        {
          success: false,
          message: `Account already deleted, please try again after ${remainingDays} days`,
        },
        { status: 400 }
      );
    }

    if(deletedAccount && deletedAccount.deletionDate && deletedAccount.deletionDate.getTime() + 15 * 24 * 60 * 60 * 1000 < new Date().getTime()){
      await DeletedAccountModel.findByIdAndDelete(deletedAccount._id);
    }
    

    const existingUserVerifiedByUsername = await OwnerModel.findOne({
      username,
      isVerified: true, // Sirf wo users jo pehle se verified hain
    });

    // Agar username already kisi verified user ke paas hai toh error return kar do
    if (existingUserVerifiedByUsername) {
      return NextResponse.json(
        {
          success: false,
          message: "Username already exists.",
        },
        {
          status: 400, // Bad Request
        }
      );
    }

    const existingUserByEmail = await OwnerModel.findOne({ email });

    // Random 6-digit verification code
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return NextResponse.json(
          {
            success: false,
            message: "Email already exists",
          },
          { status: 400 }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000); // 1 hour expiry
        await existingUserByEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new OwnerModel({
        businessName,
        email,
        username,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        phoneNumber: "",
        address: {
          localAddress: "",
          city: "",
          state: "",
          country: "",
          pincode: "",
        },
        feedbacks: [],
        isProfileCompleted: "pending",
      });

      await newUser.save();
    }

    // ✅ Send OTP Email
    const emailResponse = await sendVerificationEmail(email, verifyCode);

    if (!emailResponse.success) {
      return NextResponse.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully. Please verify your email.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering user:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error registering user",
      },
      { status: 500 }
    );
  }
}
