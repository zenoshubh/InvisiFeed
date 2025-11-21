"use server";

import axios from "axios";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function getGstinDetails(gstinNumber) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return { success: false, message: "Unauthorized" };
    }

    if (!gstinNumber) {
      return { success: false, message: "GSTIN number is required" };
    }

    const response = await axios.get(
      `${process.env.GSTIN_VERIFICATION_URL}/${gstinNumber}`
    );

    return {
      success: true,
      message: "GSTIN details fetched successfully",
      data: response.data,
    };
  } catch (error) {
    console.error("Error verifying GSTIN:", error);
    return { success: false, message: "Error verifying GSTIN" };
  }
}

