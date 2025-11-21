import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import OwnerModel from "@/models/owner";
import dbConnect from "@/lib/db-connect";

export async function POST(req) {
  await dbConnect();
  try {
   
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { gstinNumber } = await req.json();
    const username = session.user.username;

    // Call external GSTIN verification API
    const response = await fetch(
      `${process.env.GSTIN_VERIFICATION_URL}/${gstinNumber}`
    );
    const data = await response.json();

    if (data.taxpayerInfo === null) {
      return NextResponse.json(
        { success: false, message: "Invalid GSTIN" },
        { status: 400 }
      );
    }

    // Update owner's GSTIN details
    const owner = await OwnerModel.findOneAndUpdate(
      { username },
      {
        "gstinDetails.gstinNumber": gstinNumber,
        "gstinDetails.gstinHolderName": data.taxpayerInfo.tradeNam,
        "gstinDetails.gstinVerificationStatus": true,
      },
      { new: true }
    );

    if (!owner) {
      return NextResponse.json(
        { success: false, message: "Owner not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "GSTIN verified successfully",
      gstinDetails: owner.gstinDetails,
    },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying GSTIN:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
