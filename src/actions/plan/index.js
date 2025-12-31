"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import dbConnect from "@/lib/db-connect";
import AccountModel from "@/models/account";
import BusinessModel from "@/models/business";
import SubscriptionModel from "@/models/subscription";
import { addDaysToDate } from "@/utils/common/date-helpers";

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
    
    // Find account by username - only fetch _id to find business
    const account = await AccountModel.findOne({
      username: session.user.username,
    })
      .select('_id')
      .lean();

    if (!account) {
      return { success: false, message: "Account not found" };
    }

    // Find business - only fetch _id and proTrialUsed
    const business = await BusinessModel.findOne({
      account: account._id,
    })
      .select('_id proTrialUsed')
      .lean();

    if (!business) {
      return { success: false, message: "Business not found" };
    }

    // Check active subscription - only fetch needed fields
    const activeSubscription = await SubscriptionModel.findOne({
      business: business._id,
      status: "active",
    })
      .select('planType status business')
      .lean();

    if (activeSubscription?.planType === "pro") {
      return {
        success: false,
        message: "You're already on Pro Plan",
      };
    }

    if (planName === "pro-trial") {
      // Deactivate existing subscriptions
      await SubscriptionModel.updateMany(
        { business: business._id, status: "active" },
        { status: "expired" }
      );

      // Create new pro-trial subscription
      await SubscriptionModel.create({
        business: business._id,
        planType: "pro-trial",
        status: "active",
        startDate: new Date(),
        endDate: addDaysToDate(7),
      });

      // Update business proTrialUsed
      await BusinessModel.findByIdAndUpdate(business._id, {
        proTrialUsed: true,
      });
    }

    return {
      success: true,
      message: "Plan updated successfully",
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
    
    if (!session?.user?.username) {
      return { success: false, message: "Unauthorized" };
    }

    // Find account by username - only fetch _id to find business
    const account = await AccountModel.findOne({
      username: session.user.username,
    })
      .select('_id')
      .lean();

    if (!account) {
      return { success: false, message: "Account not found" };
    }

    // Find business - only fetch _id and proTrialUsed
    const business = await BusinessModel.findOne({
      account: account._id,
    })
      .select('_id proTrialUsed')
      .lean();

    if (!business) {
      return { success: false, message: "Business not found" };
    }

    // Check active subscription - only fetch needed fields
    const activeSubscription = await SubscriptionModel.findOne({
      business: business._id,
      status: "active",
    })
      .select('planType status business')
      .lean();

    if (activeSubscription?.planType === "pro-trial") {
      return { success: false, message: "User already has a Pro trial" };
    }

    // Deactivate existing subscriptions
    await SubscriptionModel.updateMany(
      { business: business._id, status: "active" },
      { status: "expired" }
    );

    // Create new pro-trial subscription
    await SubscriptionModel.create({
      business: business._id,
      planType: "pro-trial",
      status: "active",
      startDate: new Date(),
      endDate: addDaysToDate(7),
    });

    // Update business proTrialUsed
    await BusinessModel.findByIdAndUpdate(business._id, {
      proTrialUsed: true,
    });

    return {
      success: true,
      message: "Pro trial started successfully",
    };
  } catch (error) {
    console.error("Error starting pro trial:", error);
    return { success: false, message: "Failed to start pro trial" };
  }
}

