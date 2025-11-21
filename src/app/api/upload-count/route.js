import { NextResponse } from "next/server";
import OwnerModel from "@/models/owner";
import dbConnect from "@/lib/db-connect";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";


export async function GET(req) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    const username = session?.user?.username;

    if (!username) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const owner = await OwnerModel.findOne({ username });

    if (!owner) {
      return NextResponse.json(
        { success: false, message: "Owner not found" },
        { status: 404 }
      );
    }
    const isProPlan = owner?.plan?.planName === "pro" && owner?.plan?.planEndDate > new Date();

    // Calculate time remaining if daily limit is reached
    let timeLeft = null;
    const now = new Date();
    const lastReset = new Date(owner.uploadedInvoiceCount.lastDailyReset);
    const hoursSinceLastReset = (now - lastReset) / (1000 * 60 * 60);

    if(hoursSinceLastReset > 24){
      owner.uploadedInvoiceCount.dailyUploadCount = 0;
      await owner.save();
    }

    if (isProPlan && owner.uploadedInvoiceCount.dailyUploadCount >= 10) {
      timeLeft = Math.ceil(24 - hoursSinceLastReset);
    }

    if (!isProPlan && owner.uploadedInvoiceCount.dailyUploadCount >= 3) {
      timeLeft = Math.ceil(24 - hoursSinceLastReset);
    }

    return NextResponse.json({
      success: true,
      message: "Upload count fetched successfully",
      dailyUploadCount: owner.uploadedInvoiceCount.dailyUploadCount,
      timeLeft,
      dailyLimit: isProPlan ? 10 : 3,
    });
  } catch (error) {
    console.error("Error fetching upload count:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
} 