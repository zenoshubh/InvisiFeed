"use server";

import dbConnect from "@/lib/db-connect";
import AccountModel from "@/models/account";
import BusinessModel from "@/models/business";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

// Example: Use fetch for external GSTIN API call
export async function verifyGSTIN(gstinNumber) {
  if (!gstinNumber) {
    return { success: false, message: "GSTIN number is required" };
  }

  // Replace with your actual GSTIN verification API endpoint and key
  const apiUrl = `${process.env.GSTIN_VERIFICATION_URL}/${gstinNumber}`;
  try {
    const res = await fetch(apiUrl, { cache: "no-store" });
    const data = await res.json();

    if (!data?.taxpayerInfo) {
      return { success: false, valid: false, message: "Invalid GSTIN" };
    }

    return {
      success: true,
      valid: true,
      tradeName: data.taxpayerInfo.tradeNam,
      taxpayerInfo: data.taxpayerInfo,
    };
  } catch (error) {
    return { success: false, message: "GSTIN verification failed" };
  }
}

export async function saveGSTIN(gstinNumber, taxpayerInfo) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.username) {
    return { success: false, message: "Unauthorized" };
  }
  await dbConnect();

  // Find account by username
  const account = await AccountModel.findOne({
    username: session.user.username,
  }).lean();

  if (!account) {
    return { success: false, message: "Account not found" };
  }

  // Find business by account
  const business = await BusinessModel.findOne({
    account: account._id,
  });

  if (!business) {
    return { success: false, message: "Business not found" };
  }

  const gstinDetails = {
    gstinNumber,
    gstinVerificationStatus: true,
    gstinHolderName: taxpayerInfo.tradeNam || "",
  };

  business.gstinDetails = gstinDetails;
  await business.save();

  return { success: true, gstinDetails };
}
