import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/db-connect";
import mongoose from "mongoose";
import { verifyWebhookSignature } from "@/lib/razorpay";
import PaymentModel from "@/models/payment";
import SubscriptionModel from "@/models/subscription";
import BusinessModel from "@/models/business";
import { addDaysToDate } from "@/utils/common/date-helpers";

/**
 * Razorpay Webhook Handler
 * Handles payment events from Razorpay webhooks
 * Events: payment.captured, payment.failed, refund.created
 */
export async function POST(req) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature, webhookSecret);

    if (!isValid) {
      console.error("Invalid webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Parse the webhook payload
    const payload = JSON.parse(body);
    const event = payload.event;
    const paymentData = payload.payload?.payment?.entity || payload.payload?.payment;

    await dbConnect();

    // Handle different event types
    switch (event) {
      case "payment.captured":
        await handlePaymentCaptured(paymentData);
        break;

      case "payment.failed":
        await handlePaymentFailed(paymentData);
        break;

      case "refund.created":
        await handleRefundCreated(payload.payload?.refund?.entity);
        break;

      case "order.paid":
        // Handle order paid event if needed
        if (paymentData) {
          await handlePaymentCaptured(paymentData);
        }
        break;

      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Retry helper for MongoDB transactions with write conflicts
 */
async function retryTransaction(operation, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Check if it's a write conflict error
      if (error.code === 112 || error.codeName === 'WriteConflict') {
        if (attempt < maxRetries) {
          // Exponential backoff: 50ms, 100ms, 200ms
          const delay = 50 * Math.pow(2, attempt - 1);
          console.log(`Write conflict detected, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      // If not a write conflict or max retries reached, throw
      throw error;
    }
  }
  
  throw lastError;
}

/**
 * Handle payment.captured event
 * Creates subscription and updates payment record
 */
async function handlePaymentCaptured(paymentData) {
  const { order_id, id: paymentId, amount, status, created_at } = paymentData;

  if (!order_id || !paymentId) {
    console.error("Missing order_id or paymentId in webhook payload");
    return;
  }

  // Early idempotency check - before transaction
  const existingPayment = await PaymentModel.findOne({
    razorpayOrderId: order_id,
    razorpayPaymentId: paymentId,
    status: "completed",
  })
    .select("_id subscription")
    .lean();

  if (existingPayment) {
    console.log(`Payment ${paymentId} already processed`);
    return;
  }

  // Retry transaction on write conflicts
  await retryTransaction(async () => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find payment record by order ID (with write concern)
      const payment = await PaymentModel.findOne({
        razorpayOrderId: order_id,
      })
        .select("_id business subscription status razorpayPaymentId")
        .session(session);

      if (!payment) {
        console.error(`Payment record not found for order ${order_id}`);
        await session.abortTransaction();
        return;
      }

      // Double-check idempotency inside transaction
      if (payment.status === "completed" && payment.razorpayPaymentId === paymentId) {
        console.log(`Payment ${paymentId} already processed (transaction check)`);
        await session.abortTransaction();
        return;
      }

      // Check if subscription already exists
      let subscription = null;
      if (payment.subscription) {
        subscription = await SubscriptionModel.findById(payment.subscription)
          .select("_id status")
          .session(session);
      }

      // If no active subscription exists, create one
      if (!subscription || subscription.status !== "active") {
        // Deactivate existing subscriptions for this business (optimized)
        await SubscriptionModel.updateMany(
          { business: payment.business, status: "active" },
          { status: "expired" },
          { session }
        );

        // Create new pro subscription
        const planStartDate = new Date(created_at * 1000);
        const planEndDate = addDaysToDate(30, planStartDate);

        const newSubscription = await SubscriptionModel.create(
          [
            {
              business: payment.business,
              planType: "pro",
              status: "active",
              startDate: planStartDate,
              endDate: planEndDate,
            },
          ],
          { session }
        );

        subscription = newSubscription[0];
      }

      // Update payment record using findOneAndUpdate for atomicity
      await PaymentModel.findOneAndUpdate(
        { _id: payment._id },
        {
          razorpayPaymentId: paymentId,
          status: "completed",
          subscription: subscription._id,
          paidAt: new Date(created_at * 1000),
          amount: amount / 100,
        },
        { session, new: true }
      );

      await session.commitTransaction();
      console.log(`Payment ${paymentId} processed successfully via webhook`);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  });
}

/**
 * Handle payment.failed event
 * Updates payment status to failed
 */
async function handlePaymentFailed(paymentData) {
  const { order_id, id: paymentId } = paymentData;

  if (!order_id) {
    console.error("Missing order_id in failed payment webhook");
    return;
  }

  await retryTransaction(async () => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Use findOneAndUpdate for atomic operation
      const result = await PaymentModel.findOneAndUpdate(
        { razorpayOrderId: order_id },
        {
          razorpayPaymentId: paymentId || undefined,
          status: "failed",
        },
        { session, new: true }
      );

      if (result) {
        console.log(`Payment ${order_id} marked as failed`);
      } else {
        console.error(`Payment record not found for failed order ${order_id}`);
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  });
}

/**
 * Handle refund.created event
 * Updates payment status to refunded and cancels subscription
 */
async function handleRefundCreated(refundData) {
  const { payment_id, amount, created_at } = refundData;

  if (!payment_id) {
    console.error("Missing payment_id in refund webhook");
    return;
  }

  await retryTransaction(async () => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find payment to get business ID
      const payment = await PaymentModel.findOne({
        razorpayPaymentId: payment_id,
      })
        .select("_id business")
        .session(session);

      if (payment) {
        // Update payment status atomically
        await PaymentModel.findByIdAndUpdate(
          payment._id,
          { status: "refunded" },
          { session }
        );

        // Cancel active subscriptions for this business
        await SubscriptionModel.updateMany(
          { business: payment.business, status: "active" },
          {
            status: "cancelled",
            cancelledAt: new Date(created_at * 1000),
            cancellationReason: "Payment refunded",
          },
          { session }
        );

        console.log(`Payment ${payment_id} refunded, subscription cancelled`);
      } else {
        console.error(`Payment record not found for refund ${payment_id}`);
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  });
}

