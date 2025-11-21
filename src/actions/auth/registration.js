"use server";

import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db-connect";
import OwnerModel from "@/models/owner";
import DeletedAccountModel from "@/models/deleted-account";
import sendVerificationEmail from "@/utils/send-verification-email";

// ✅ Fix: Add prevState parameter for useActionState
export async function registerUser(prevState, formData) {
  try {
    console.log(formData);
    const businessName = formData.get("businessName");
    const email = formData.get("email");
    const username = formData.get("username");
    const password = formData.get("password");

    await dbConnect();

    // Check deleted accounts
    const deletedAccount = await DeletedAccountModel.findOne({ email });
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
        };
      } else {
        await DeletedAccountModel.findByIdAndDelete(deletedAccount._id);
      }
    }

    // Check existing users
    const existingVerifiedUser = await OwnerModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUser) {
      return { success: false, message: "Username already exists" };
    }

    const existingEmailUser = await OwnerModel.findOne({ email });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingEmailUser) {
      if (existingEmailUser.isVerified) {
        return { success: false, message: "Email already exists" };
      }

      // Update existing unverified user
      existingEmailUser.password = hashedPassword;
      existingEmailUser.verifyCode = verifyCode;
      existingEmailUser.verifyCodeExpiry = new Date(Date.now() + 3600000);
      existingEmailUser.businessName = businessName;
      existingEmailUser.username = username;
      await existingEmailUser.save();
    } else {
      // Create new user
      const newUser = new OwnerModel({
        businessName,
        email,
        username,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: new Date(Date.now() + 3600000),
        isVerified: false,
        phoneNumber: "",
        address: {
          localAddress: "",
          city: "",
          state: "",
          country: "",
          pincode: "",
        },
        isProfileCompleted: "pending",
      });
      await newUser.save();
    }

    const emailResponse = await sendVerificationEmail(email, verifyCode);

    if (!emailResponse.success) {
      return { success: false, message: emailResponse.message };
    }

    return {
      success: true,
      message: "User registered successfully. Please verify your email.",
      username: username, // ✅ Add username for redirect
    };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, message: "Registration failed" };
  }
}

export async function verifyUserAccount(username, code) {
  try {
    await dbConnect();

    const decodedUsername = decodeURIComponent(username);
    const user = await OwnerModel.findOne({ username: decodedUsername });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();
      return { success: true, message: "Account verified successfully" };
    } else if (!isCodeNotExpired) {
      return {
        success: false,
        message: "Verification code has expired, please sign up again",
      };
    } else {
      return { success: false, message: "Incorrect verification code" };
    }
  } catch (error) {
    console.error("Verification error:", error);
    return { success: false, message: "Verification failed" };
  }
}

export async function checkUsernameAvailability(username) {
  try {
    if (!username) {
      return { success: true, message: "" };
    }

    await dbConnect();

    const existingUser = await OwnerModel.findOne({
      username: username.toLowerCase(),
      isVerified: true,
    }).lean();

    if (existingUser) {
      return {
        success: false,
        message: "Username already taken",
      };
    }

    return {
      success: true,
      message: "Username available",
    };
  } catch (error) {
    console.error("Username check error:", error);
    return {
      success: false,
      message: "Error checking username",
    };
  }
}
