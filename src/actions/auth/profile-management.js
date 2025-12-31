"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import dbConnect from "@/lib/db-connect";
import AccountModel from "@/models/account";
import BusinessModel from "@/models/business";
import { revalidatePath } from "next/cache";
import { completeProfileSchema } from "@/schemas/profile/complete-profile";
import { extractFormData } from "@/utils/common/form-data-helpers";

export async function completeUserProfile(prevState, formData) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.username) {
      return {
        success: false,
        message: "Unauthorized",
        errors: {},
      };
    }

    // Extract form data
    const rawData = extractFormData(formData, [
      "businessName",
      "phoneNumber",
      "localAddress",
      "city",
      "state",
      "country",
      "pincode",
    ]);

    // Validate the data
    const validation = completeProfileSchema.safeParse(rawData);

    if (!validation.success) {
      return {
        success: false,
        message: "Please fill in all required fields",
        errors: validation.error.flatten().fieldErrors,
      };
    }

    const validatedData = validation.data;

    await dbConnect();

    // Find account by username - only fetch _id
    const account = await AccountModel.findOne({
      username: session.user.username,
    })
      .select('_id')
      .lean();

    if (!account) {
      return {
        success: false,
        message: "Account not found",
        errors: {},
      };
    }

    // Check if all required fields are provided
    const hasCompleteAddress =
      validatedData.localAddress?.trim() &&
      validatedData.city?.trim() &&
      validatedData.state?.trim() &&
      validatedData.country?.trim() &&
      validatedData.pincode?.trim();

    let profileStatus = "pending";

    profileStatus =
      validatedData.businessName?.trim() &&
      validatedData.phoneNumber?.trim() &&
      hasCompleteAddress
        ? "completed"
        : "skipped";

    const updatedBusiness = await BusinessModel.findOneAndUpdate(
      { account: account._id },
      {
        businessName: validatedData.businessName,
        phoneNumber: validatedData.phoneNumber,
        address: {
          localAddress: validatedData.localAddress,
          city: validatedData.city,
          state: validatedData.state,
          country: validatedData.country,
          pincode: validatedData.pincode,
        },
        isProfileCompleted: profileStatus,
      },
      { new: true }
    ).lean();

    if (!updatedBusiness) {
      return {
        success: false,
        message: "Business not found",
        errors: {},
      };
    }

    // Revalidate the profile page and user pages
    revalidatePath("/complete-profile");
    revalidatePath(`/user/${session.user.username}/generate`);

    // Return success with user data for session update
    return {
      success: true,
      message: "Profile completed successfully!",
      profileStatus,
      errors: {},
      updatedUser: {
        businessName: updatedBusiness.businessName,
        phoneNumber: updatedBusiness.phoneNumber,
        address: updatedBusiness.address,
      },
    };
  } catch (error) {
    console.error("Profile completion error:", error);

    return {
      success: false,
      message: "Profile update failed",
      errors: {},
    };
  }
}

export async function skipProfileCompletion(prevState) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.username) {
      return {
        success: false,
        message: "Unauthorized",
        errors: {},
      };
    }

    await dbConnect();

    // Find account by username - only fetch _id
    const account = await AccountModel.findOne({
      username: session.user.username,
    })
      .select('_id')
      .lean();

    if (!account) {
      return {
        success: false,
        message: "Account not found",
        errors: {},
      };
    }

    const updatedBusiness = await BusinessModel.findOneAndUpdate(
      { account: account._id },
      {
        isProfileCompleted: "skipped",
      },
      { new: true }
    ).lean();

    if (!updatedBusiness) {
      return {
        success: false,
        message: "Failed to skip profile",
        errors: {},
      };
    }

    // Revalidate and redirect
    revalidatePath("/complete-profile");
    revalidatePath(`/user/${session.user.username}/generate`);

    return {
      success: true,
      message: "Profile completion skipped successfully!",
      profileStatus: "skipped",
      errors: {},
    };
  } catch (error) {
    console.error("Skip profile error:", error);
    return {
      success: false,
      message: "Failed to skip profile completion",
      errors: {},
    };
  }
}
