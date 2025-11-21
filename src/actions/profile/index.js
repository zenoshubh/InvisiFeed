"use server";

import dbConnect from "@/lib/db-connect";
import { getAuthenticatedOwnerDocument } from "@/lib/auth/session-utils";
import { successResponse, errorResponse } from "@/utils/response";

export async function updateProfile(profileData) {
  try {
    await dbConnect();
    const ownerResult = await getAuthenticatedOwnerDocument();
    if (!ownerResult.success) {
      return errorResponse(ownerResult.message);
    }
    const { owner: user } = ownerResult;

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
    await user.save();

    // Return success response
    return successResponse("Profile updated successfully", {
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        businessName: user.businessName,
        phoneNumber: user.phoneNumber,
        address: user.address,
        isProfileCompleted: user.isProfileCompleted,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return errorResponse("Error updating profile");
  }
}

