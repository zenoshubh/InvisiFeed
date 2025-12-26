"use server";

import dbConnect from "@/lib/db-connect";
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
} from "@/lib/razorpay";
import { getAuthenticatedBusinessDocument, getAuthenticatedBusiness } from "@/lib/auth/session-utils";
import SubscriptionModel from "@/models/subscription";
import BusinessModel from "@/models/business";
import { successResponse, errorResponse } from "@/utils/response";
import { addDaysToDate } from "@/utils/common/date-helpers";

export async function createOrder() {
  await dbConnect();

  try {
    const businessResult = await getAuthenticatedBusinessDocument();
    if (!businessResult.success) {
      return errorResponse(businessResult.message);
    }
    const { business } = businessResult;

    // Check if business already has a pro plan
    if (business.plan?.planName === "pro") {
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
    const businessResult = await getAuthenticatedBusinessDocument();
    if (!businessResult.success) {
      return errorResponse(businessResult.message);
    }
    const { business, businessData } = businessResult;

    // Verify payment signature
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return errorResponse("Invalid payment signature");
    }

    // Deactivate existing subscriptions
    await SubscriptionModel.updateMany(
      { business: businessData._id, status: "active" },
      { status: "expired" }
    );

    // Create new pro subscription
    const planStartDate = new Date();
    const planEndDate = addDaysToDate(30);

    const newSubscription = await SubscriptionModel.create({
      business: businessData._id,
      planType: "pro",
      status: "active",
      startDate: planStartDate,
      endDate: planEndDate,
    });

    return successResponse("Payment verified successfully", {
      user: {
        plan: {
          planName: newSubscription.planType,
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
    const businessResult = await getAuthenticatedBusinessDocument();
    if (!businessResult.success) {
      return errorResponse(businessResult.message);
    }
    const { business, businessData } = businessResult;

    if (planName === "pro-trial") {
      if (business.proTrialUsed) {
        return errorResponse("Pro trial already used");
      }

      if (business.plan?.planName === "pro-trial") {
        return errorResponse("User already has a Pro trial");
      }

      // Deactivate existing subscriptions
      await SubscriptionModel.updateMany(
        { business: businessData._id, status: "active" },
        { status: "expired" }
      );

      const planStartDate = new Date();
      const planEndDate = addDaysToDate(7);

      // Create new pro-trial subscription
      const newSubscription = await SubscriptionModel.create({
        business: businessData._id,
        planType: "pro-trial",
        status: "active",
        startDate: planStartDate,
        endDate: planEndDate,
      });

      // Update business proTrialUsed
      await BusinessModel.findByIdAndUpdate(businessData._id, {
        proTrialUsed: true,
      });

      return successResponse("Successfully switched to Pro trial plan", {
        user: {
          plan: {
            planName: newSubscription.planType,
            planStartDate: planStartDate.toISOString(),
            planEndDate: planEndDate.toISOString(),
          },
          proTrialUsed: true,
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
    const businessResult = await getAuthenticatedBusiness();
    if (!businessResult.success) {
      return errorResponse(businessResult.message);
    }
    const { business, account } = businessResult;

    return successResponse("User plan retrieved successfully", {
      user: {
        plan: business.plan
          ? {
              planName: business.plan.planName,
              planStartDate: business.plan.planStartDate?.toISOString(),
              planEndDate: business.plan.planEndDate?.toISOString(),
            }
          : null,
        proTrialUsed: business.proTrialUsed,
        businessName: business.businessName,
        email: account.email,
        phoneNumber: business.phoneNumber,
      },
    });
  } catch (error) {
    console.error("Error getting user plan:", error);
    return errorResponse("Failed to get user plan");
  }
}
