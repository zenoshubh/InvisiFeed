import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/db-connect";
import OwnerModel from "@/models/owner";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { planName } = await req.json();

    if (!["free", "pro" , "pro-trial"].includes(planName)) {
      return NextResponse.json(
        { success: false, message: "Invalid plan name" },
        { status: 400 }
      );
    }

    await dbConnect();
    const user = await OwnerModel.findById(session.user.id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

   if(user.planName === "pro"){
    return NextResponse.json({
      success: false,
      message: "You're already on Pro Plan",
    }, { status: 400 });
  }

    if (planName === "pro-trial") {
      user.plan = {
        planName: "pro-trial",
        planStartDate: new Date(),
        planEndDate: new Date().setDate(new Date().getDate() + 7),
      };
      user.proTrialUsed = true;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Plan updated successfully",
      user
    } , { status: 200 });
  } catch (error) {
    console.error("Error updating plan:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update plan",
      },
      { status: 500 }
    );
  }
} 
    