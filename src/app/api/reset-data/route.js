import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import OwnerModel from "@/models/owner";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import FeedbackModel from "@/models/feedback";
import InvoiceModel from "@/models/invoice";

export async function DELETE(request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const username = session?.user?.username;

    if (!username) {
      return NextResponse.json(
        { success: false, message: "Username is required" },
        { status: 400 }
      );
    }

    const owner = await OwnerModel.findOne({ username });
    if (!owner) {
      return NextResponse.json(
        { success: false, message: "Owner not found" },
        { status: 404 }
      );
    }

    // Reset data
    owner.currentRecommendedActions = {
      improvements: [],
      strengths: [],
    };

    const deletedFeedbacks = await FeedbackModel.deleteMany({
      givenTo: owner._id,
    });
  

    owner.feedbacks = [];

    const deletedInvoices = await InvoiceModel.deleteMany({ owner: owner._id });
   

    await owner.save();

    return NextResponse.json(
      {
        success: true,
        message: "Data reset successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error resetting data:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
