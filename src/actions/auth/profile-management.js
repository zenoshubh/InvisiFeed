"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import dbConnect from "@/lib/db-connect";
import OwnerModel from "@/models/owner";
import { revalidatePath } from "next/cache";
import { completeProfileSchema } from "@/schemas/profile/complete-profile";

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
    const rawData = {
      businessName: formData.get("businessName"),
      phoneNumber: formData.get("phoneNumber"),
      localAddress: formData.get("localAddress"),
      city: formData.get("city"),
      state: formData.get("state"),
      country: formData.get("country"),
      pincode: formData.get("pincode"),
    };

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

    const updatedUser = await OwnerModel.findOneAndUpdate(
      { username: session.user.username },
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
    );

    // Convert to plain object for serialization
    const plainUser = updatedUser?.toObject
      ? updatedUser.toObject()
      : updatedUser;

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
        businessName: plainUser.businessName,
        phoneNumber: plainUser.phoneNumber,
        address: plainUser.address,
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

    const updatedUser = await OwnerModel.findOneAndUpdate(
      { username: session.user.username },
      {
        isProfileCompleted: "skipped",
      },
      { new: true }
    );

    if (!updatedUser) {
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
