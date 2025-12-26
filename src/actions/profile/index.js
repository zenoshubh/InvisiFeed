"use server";

import dbConnect from "@/lib/db-connect";
import { getAuthenticatedBusinessDocument } from "@/lib/auth/session-utils";
import BusinessModel from "@/models/business";
import { successResponse, errorResponse } from "@/utils/response";

export async function updateProfile(profileData) {
  try {
    await dbConnect();
    const businessResult = await getAuthenticatedBusinessDocument();
    if (!businessResult.success) {
      return errorResponse(businessResult.message);
    }
    const { businessData, account } = businessResult;

    // Update business fields
    const updateData = {};
    
    if (profileData?.businessName) {
      updateData.businessName = profileData.businessName;
    }
    if (
      profileData?.phoneNumber !== undefined &&
      profileData?.phoneNumber !== null
    ) {
      updateData.phoneNumber = profileData.phoneNumber;
    }
    if (profileData?.address) {
      updateData.address = profileData.address;
    }

    // Check if all required fields are filled
    const hasBusinessName =
      (updateData.businessName || businessData.businessName) &&
      (updateData.businessName || businessData.businessName).trim() !== "";
    const hasPhoneNumber =
      (updateData.phoneNumber !== undefined
        ? updateData.phoneNumber
        : businessData.phoneNumber) &&
      (updateData.phoneNumber !== undefined
        ? updateData.phoneNumber
        : businessData.phoneNumber).trim() !== "";

    const address = updateData.address || businessData.address;
    const hasAddress =
      address &&
      address.localAddress &&
      address.localAddress.trim() !== "" &&
      address.city &&
      address.city.trim() !== "" &&
      address.state &&
      address.state.trim() !== "" &&
      address.country &&
      address.country.trim() !== "" &&
      address.pincode &&
      address.pincode.trim() !== "";

    // Update profile completion status
    if (hasBusinessName && hasPhoneNumber && hasAddress) {
      updateData.isProfileCompleted = "completed";
    } else {
      updateData.isProfileCompleted = "skipped";
    }

    // Update business
    const updatedBusiness = await BusinessModel.findByIdAndUpdate(
      businessData._id,
      updateData,
      { new: true }
    ).lean();

    // Return success response (ensure id is a string)
    return successResponse("Profile updated successfully", {
      user: {
        id: updatedBusiness._id.toString(),
        email: account.email,
        username: account.username,
        businessName: updatedBusiness.businessName,
        phoneNumber: updatedBusiness.phoneNumber,
        address: updatedBusiness.address,
        isProfileCompleted: updatedBusiness.isProfileCompleted,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return errorResponse("Error updating profile");
  }
}

