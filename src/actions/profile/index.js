"use server";

import dbConnect from "@/lib/db-connect";
import OwnerModel from "@/models/owner";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function updateProfile(profileData) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const username = session?.user?.username;

    if (!username) {
      return { success: false, message: "Unauthorized" };
    }

    // Find the user
    const user = await OwnerModel.findOne({ username });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Update user fields
    if (profileData?.businessName) {
      user.businessName = profileData.businessName;
    }
    if (
      profileData?.phoneNumber !== undefined &&
      profileData?.phoneNumber !== null
    ) {
      user.phoneNumber = profileData.phoneNumber;
    }
    if (profileData?.address) {
      user.address = profileData.address;
    }

    // Check if all required fields are filled
    const hasBusinessName =
      user.businessName && user.businessName.trim() !== "";
    const hasPhoneNumber = user.phoneNumber && user.phoneNumber.trim() !== "";

    const hasAddress =
      user.address &&
      user.address.localAddress &&
      user.address.localAddress.trim() !== "" &&
      user.address.city &&
      user.address.city.trim() !== "" &&
      user.address.state &&
      user.address.state.trim() !== "" &&
      user.address.country &&
      user.address.country.trim() !== "" &&
      user.address.pincode &&
      user.address.pincode.trim() !== "";

    // Update profile completion status
    if (hasBusinessName && hasPhoneNumber && hasAddress) {
      user.isProfileCompleted = "completed";
    } else {
      user.isProfileCompleted = "skipped";
    }

    // Save the updated user
    const updatedUser = await user.save();

    // Return success response
    return {
      success: true,
      message: "Profile updated successfully",
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          businessName: user.businessName,
          phoneNumber: user.phoneNumber,
          address: user.address,
          isProfileCompleted: user.isProfileCompleted,
        },
      },
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, message: "Error updating profile" };
  }
}

