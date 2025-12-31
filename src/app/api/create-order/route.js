import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import AccountModel from "@/models/account";
import BusinessModel from "@/models/business";
import SubscriptionModel from "@/models/subscription";
import { authOptions } from "@/lib/auth/options";
import { getServerSession } from "next-auth";
import { createRazorpayOrder } from "@/lib/razorpay";

export async function POST(req) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.username) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

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

    // const { amount, currency = "INR" } = await req.json();
    const amount = process.env.SUBSCRIPTION_AMOUNT;
    const currency = "INR";

    const options = {
      amount: amount * 100, // Convert to paise
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await createRazorpayOrder(options);

    return NextResponse.json(
      {
        success: true,
        order,
        message: "Order created successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create order",
      },
      { status: 500 }
    );
  }
}
