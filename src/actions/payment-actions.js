"use server";

import dbConnect from "@/lib/db-connect";
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
} from "@/lib/razorpay";
import { getAuthenticatedOwnerDocument, getAuthenticatedOwner } from "@/lib/auth/session-utils";
import { successResponse, errorResponse } from "@/utils/response";
import { addDaysToDate } from "@/utils/common/date-helpers";

export async function createOrder() {
  await dbConnect();

  try {
    const ownerResult = await getAuthenticatedOwnerDocument();
    if (!ownerResult.success) {
      return errorResponse(ownerResult.message);
    }
    const { owner: user } = ownerResult;

    // Check if user already has a pro plan
    if (user.plan?.planName === "pro") {
      return errorResponse("User already has a Pro plan");
    }

    const amount = process.env.SUBSCRIPTION_AMOUNT;
    const currency = "INR";

    const options = {
      amount: amount * 100, // Convert to paise
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await createRazorpayOrder(options);

    return successResponse("Order created successfully", {
      order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return errorResponse("Failed to create order");
  }
}

export async function verifyPayment({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) {
  await dbConnect();

  try {
    const ownerResult = await getAuthenticatedOwnerDocument();
    if (!ownerResult.success) {
      return errorResponse(ownerResult.message);
    }
    const { owner: user } = ownerResult;

    // Verify payment signature
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return errorResponse("Invalid payment signature");
    }

    const planStartDate = new Date();
    const planEndDate = addDaysToDate(30);

    user.plan = {
      planName: "pro",
      planStartDate,
      planEndDate,
    };

    await user.save();

    return successResponse("Payment verified successfully", {
      user: {
        plan: {
          planName: user.plan.planName,
          planStartDate: planStartDate.toISOString(),
          planEndDate: planEndDate.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return errorResponse("Failed to verify payment");
  }
}

export async function updatePlan({ planName }) {
  await dbConnect();

  try {
    const ownerResult = await getAuthenticatedOwnerDocument();
    if (!ownerResult.success) {
      return errorResponse(ownerResult.message);
    }
    const { owner: user } = ownerResult;

    if (planName === "pro-trial") {
      if (user.proTrialUsed) {
        return errorResponse("Pro trial already used");
      }

      if (user.plan?.planName === "pro-trial") {
        return errorResponse("User already has a Pro trial");
      }

      const planStartDate = new Date();
      const planEndDate = addDaysToDate(7);

      user.plan = {
        planName: "pro-trial",
        planStartDate,
        planEndDate,
      };
      user.proTrialUsed = true;

      await user.save();

      return successResponse("Successfully switched to Pro trial plan", {
        user: {
          plan: {
            planName: user.plan.planName,
            planStartDate: planStartDate.toISOString(),
            planEndDate: planEndDate.toISOString(),
          },
          proTrialUsed: user.proTrialUsed,
        },
      });
    }

    return errorResponse("Invalid plan name");
  } catch (error) {
    console.error("Error updating plan:", error);
    return errorResponse("Failed to update plan");
  }
}

export async function getUserPlan() {
  await dbConnect();

  try {
    const ownerResult = await getAuthenticatedOwner();
    if (!ownerResult.success) {
      return errorResponse(ownerResult.message);
    }
    const { owner: user } = ownerResult;

    return successResponse("User plan retrieved successfully", {
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
    });
  } catch (error) {
    console.error("Error getting user plan:", error);
    return errorResponse("Failed to get user plan");
  }
}
