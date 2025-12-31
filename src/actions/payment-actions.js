"use server";

import dbConnect from "@/lib/db-connect";
import mongoose from "mongoose";
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
} from "@/lib/razorpay";
import { getAuthenticatedBusinessDocument, getAuthenticatedBusiness } from "@/lib/auth/session-utils";
import PaymentModel from "@/models/payment";
import SubscriptionModel from "@/models/subscription";
import BusinessModel from "@/models/business";
import { successResponse, errorResponse } from "@/utils/response";
import { addDaysToDate } from "@/utils/common/date-helpers";

export async function createOrder() {
  await dbConnect();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const businessResult = await getAuthenticatedBusinessDocument();
    if (!businessResult.success) {
      await session.abortTransaction();
      return errorResponse(businessResult.message);
    }
    const { business, businessData } = businessResult;

    // Check if business already has a pro plan
    if (business.plan?.planName === "pro") {
      await session.abortTransaction();
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

    // Create payment record in pending status
    const payment = await PaymentModel.create(
      [
        {
          business: businessData._id,
          razorpayOrderId: order.id,
          amount: parseFloat(amount),
          currency: currency,
          status: "pending",
        },
      ],
      { session }
    );

    await session.commitTransaction();

    return successResponse("Order created successfully", {
      order,
      paymentId: payment[0]._id.toString(),
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error creating order:", error);
    return errorResponse("Failed to create order");
  } finally {
    session.endSession();
  }
}

export async function verifyPayment({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) {
  await dbConnect();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const businessResult = await getAuthenticatedBusinessDocument();
    if (!businessResult.success) {
      await session.abortTransaction();
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
      await session.abortTransaction();
      return errorResponse("Invalid payment signature");
    }

    // Check for idempotency - if payment already processed, return existing data
    const existingPayment = await PaymentModel.findOne({
      razorpayPaymentId: razorpay_payment_id,
      status: "completed",
    })
      .select("subscription status")
      .lean();

    if (existingPayment) {
      // Payment already processed, get subscription details
      const subscription = await SubscriptionModel.findById(
        existingPayment.subscription
      )
        .select("planType startDate endDate")
        .lean();

      if (subscription) {
        await session.abortTransaction(); // No transaction needed, just return
        return successResponse("Payment already processed", {
          user: {
            plan: {
              planName: subscription.planType,
              planStartDate: subscription.startDate.toISOString(),
              planEndDate: subscription.endDate.toISOString(),
            },
          },
        });
      }
    }

    // Find payment record by order ID
    const payment = await PaymentModel.findOne({
      razorpayOrderId: razorpay_order_id,
    }).session(session);

    if (!payment) {
      await session.abortTransaction();
      return errorResponse("Payment record not found");
    }

    // Check if payment is already completed (another idempotency check)
    if (payment.status === "completed") {
      const subscription = await SubscriptionModel.findOne({
        _id: payment.subscription,
        status: "active",
      })
        .select("planType startDate endDate")
        .lean();

      if (subscription) {
        await session.abortTransaction();
        return successResponse("Payment already processed", {
          user: {
            plan: {
              planName: subscription.planType,
              planStartDate: subscription.startDate.toISOString(),
              planEndDate: subscription.endDate.toISOString(),
            },
          },
        });
      }
    }

    // Deactivate existing subscriptions
    await SubscriptionModel.updateMany(
      { business: businessData._id, status: "active" },
      { status: "expired" }
    ).session(session);

    // Create new pro subscription
    const planStartDate = new Date();
    const planEndDate = addDaysToDate(30);

    const newSubscription = await SubscriptionModel.create(
      [
        {
      business: businessData._id,
      planType: "pro",
      status: "active",
      startDate: planStartDate,
      endDate: planEndDate,
        },
      ],
      { session }
    );

    // Update payment record with payment details
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = "completed";
    payment.subscription = newSubscription[0]._id;
    payment.paidAt = new Date();
    await payment.save({ session });

    await session.commitTransaction();

    return successResponse("Payment verified successfully", {
      user: {
        plan: {
          planName: newSubscription[0].planType,
          planStartDate: planStartDate.toISOString(),
          planEndDate: planEndDate.toISOString(),
        },
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error verifying payment:", error);
    return errorResponse("Failed to verify payment");
  } finally {
    session.endSession();
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
