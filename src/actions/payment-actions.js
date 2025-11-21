"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/db-connect";
import OwnerModel from "@/models/owner";
import crypto from "crypto";
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
} from "@/lib/razorpay";

export async function createOrder() {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await OwnerModel.findById(session.user.id);

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Check if user already has a pro plan
    if (user.plan?.planName === "pro") {
      return { success: false, message: "User already has a Pro plan" };
    }

    const amount = process.env.SUBSCRIPTION_AMOUNT;
    const currency = "INR";

    const options = {
      amount: amount * 100, // Convert to paise
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await createRazorpayOrder(options);

    return {
      success: true,
      message: "Order created successfully",
      data: {
        order,
      },
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      success: false,
      message: "Failed to create order",
    };
  }
}

export async function verifyPayment({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return { success: false, message: "Unauthorized" };
    }

    // Verify payment signature
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return { success: false, message: "Invalid payment signature" };
    }

    // Update user plan
    const user = await OwnerModel.findById(session.user.id);

    if (!user) {
      return { success: false, message: "User not found" };
    }

    const planStartDate = new Date();
    const planEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    user.plan = {
      planName: "pro",
      planStartDate,
      planEndDate,
    };

    await user.save();

    return {
      success: true,
      message: "Payment verified successfully",
      user: {
        plan: {
          planName: user.plan.planName,
          planStartDate: planStartDate.toISOString(),
          planEndDate: planEndDate.toISOString(),
        },
      },
    };
  } catch (error) {
    console.error("Error verifying payment:", error);
    return {
      success: false,
      message: "Failed to verify payment",
    };
  }
}

export async function updatePlan({ planName }) {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await OwnerModel.findById(session.user.id);

    if (!user) {
      return { success: false, message: "User not found" };
    }

    if (planName === "pro-trial") {
      if (user.proTrialUsed) {
        return { success: false, message: "Pro trial already used" };
      }

      if (user.plan?.planName === "pro-trial") {
        return { success: false, message: "User already has a Pro trial" };
      }

      const planStartDate = new Date();
      const planEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      user.plan = {
        planName: "pro-trial",
        planStartDate,
        planEndDate,
      };
      user.proTrialUsed = true;

      await user.save();

      return {
        success: true,
        message: "Successfully switched to Pro trial plan",
        user: {
          plan: {
            planName: user.plan.planName,
            planStartDate: planStartDate.toISOString(),
            planEndDate: planEndDate.toISOString(),
          },
          proTrialUsed: user.proTrialUsed,
        },
      };
    }

    return { success: false, message: "Invalid plan name" };
  } catch (error) {
    console.error("Error updating plan:", error);
    return {
      success: false,
      message: "Failed to update plan",
    };
  }
}

export async function getUserPlan() {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await OwnerModel.findById(session.user.id).select(
      "plan proTrialUsed businessName email phoneNumber"
    );

    if (!user) {
      return { success: false, message: "User not found" };
    }

    return {
      success: true,
      user: {
        plan: user.plan
          ? {
              planName: user.plan.planName,
              planStartDate: user.plan.planStartDate?.toISOString(),
              planEndDate: user.plan.planEndDate?.toISOString(),
            }
          : null,
        proTrialUsed: user.proTrialUsed,
        businessName: user.businessName,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
    };
  } catch (error) {
    console.error("Error getting user plan:", error);
    return {
      success: false,
      message: "Failed to get user plan",
    };
  }
}
