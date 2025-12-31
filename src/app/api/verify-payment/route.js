import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import AccountModel from "@/models/account";
import BusinessModel from "@/models/business";
import SubscriptionModel from "@/models/subscription";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { verifyRazorpaySignature } from "@/lib/razorpay";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    // Verify the payment signature
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 400 }
      );
    }

    await dbConnect();
    
    // Find account by username - only fetch _id to find business
    const account = await AccountModel.findOne({
      username: session.user.username,
    })
      .select('_id')
      .lean();

    if (!account) {
      return NextResponse.json(
        { success: false, message: "Account not found" },
        { status: 404 }
      );
    }

    // Find business - only fetch _id
    const business = await BusinessModel.findOne({
      account: account._id,
    })
      .select('_id')
      .lean();

    if (!business) {
      return NextResponse.json(
        { success: false, message: "Business not found" },
        { status: 404 }
      );
    }

    // Check if business already has a pro plan - only fetch needed fields
    const activeSubscription = await SubscriptionModel.findOne({
      business: business._id,
      status: "active",
      planType: "pro",
    })
      .select('planType status business')
      .lean();

    if (activeSubscription) {
      return NextResponse.json(
        { success: false, message: "User already has a Pro plan" },
        { status: 400 }
      );
    }

    // Deactivate existing subscriptions
    await SubscriptionModel.updateMany(
      { business: business._id, status: "active" },
      { status: "expired" }
    );

    // Set plan to Pro for 30 days
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Create new pro subscription
    const newSubscription = await SubscriptionModel.create({
      business: business._id,
      planType: "pro",
      status: "active",
      startDate: now,
      endDate: thirtyDaysLater,
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified and plan updated successfully",
      user: {
        plan: {
          planName: newSubscription.planType,
          planStartDate: now,
          planEndDate: thirtyDaysLater,
        },
      },
    }, {status:200});
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to verify payment",
      },
      { status: 500 }
    );
  }
} 