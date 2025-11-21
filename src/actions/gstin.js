"use server";

import dbConnect from "@/lib/db-connect";
import OwnerModel from "@/models/owner";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

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

  const gstinDetails = {
    gstinNumber,
    gstinVerificationStatus: true,
    tradeName: taxpayerInfo.tradeNam,
    taxpayerInfo,
  };

  await OwnerModel.findOneAndUpdate(
    { username: session.user.username },
    { gstinDetails },
    { new: true }
  );

  return { success: true, gstinDetails };
}
