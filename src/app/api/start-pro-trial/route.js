import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import OwnerModel from "@/models/owner";
import { authOptions } from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

export async function POST(req) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user = await OwnerModel.findById(session.user.id);

  if (!user) {
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );
  }

  if (user.plan?.planName === "pro-trial") {
    return NextResponse.json(
      { success: false, message: "User already has a Pro trial" },
      { status: 400 }
    );
  }

  user.plan = {
    planName: "pro-trial",
    planStartDate: new Date(),
    planEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };

  user.proTrialUsed = true;

  await user.save();

  return NextResponse.json(
    {
      success: true,
      message: "Pro trial started successfully",
    },
    { status: 200 }
  );
}
