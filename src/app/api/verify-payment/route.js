import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import OwnerModel from "@/models/owner";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
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

    // Update user's plan
    await dbConnect();
    const user = await OwnerModel.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Check if user already has a pro plan
    if (user.plan?.planName === "pro") {
      return NextResponse.json(
        { success: false, message: "User already has a Pro plan" },
        { status: 400 }
      );
    }

    // Set plan to Pro for 30 days
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    user.plan = {
      planName: "pro",
      planStartDate: now,
      planEndDate: thirtyDaysLater,
    };

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Payment verified and plan updated successfully",
      user
    } , {status:200});
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