"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import dbConnect from "@/lib/db-connect";
import OwnerModel from "@/models/owner";

export async function updatePlan(planName) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, message: "Unauthorized" };
    }

    if (!["free", "pro", "pro-trial"].includes(planName)) {
      return { success: false, message: "Invalid plan name" };
    }

    await dbConnect();
    const user = await OwnerModel.findById(session.user.id);

    if (!user) {
      return { success: false, message: "User not found" };
    }

    if (user.plan?.planName === "pro") {
      return {
        success: false,
        message: "You're already on Pro Plan",
      };
    }

    if (planName === "pro-trial") {
      user.plan = {
        planName: "pro-trial",
        planStartDate: new Date(),
        planEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };
      user.proTrialUsed = true;
    }

    await user.save();

    return {
      success: true,
      message: "Plan updated successfully",
      data: {
        user,
      },
    };
  } catch (error) {
    console.error("Error updating plan:", error);
    return { success: false, message: "Failed to update plan" };
  }
}

export async function startProTrial() {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    const user = await OwnerModel.findById(session?.user?.id);

    if (!user) {
      return { success: false, message: "User not found" };
    }

    if (user.plan?.planName === "pro-trial") {
      return { success: false, message: "User already has a Pro trial" };
    }

    user.plan = {
      planName: "pro-trial",
      planStartDate: new Date(),
      planEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    user.proTrialUsed = true;

    await user.save();

    return {
      success: true,
      message: "Pro trial started successfully",
    };
  } catch (error) {
    console.error("Error starting pro trial:", error);
    return { success: false, message: "Failed to start pro trial" };
  }
}

