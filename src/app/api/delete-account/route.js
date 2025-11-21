import dbConnect from "@/lib/db-connect";
import DeletedAccountModel from "@/models/deleted-account";
import OwnerModel from "@/models/owner";
import InvoiceModel from "@/models/invoice";
import FeedbackModel from "@/models/feedback";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function DELETE(req) {
  await dbConnect();
  try {
    
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const owner = await OwnerModel.findOne({ email: session.user.email });
    if (!owner) {
      return NextResponse.json(
        { success: false, message: "Owner not found" },
        { status: 404 }
      );
    }

    const deletedAccount = await DeletedAccountModel.create({
      email: owner.email,
      deletionDate: new Date(),
    });

    if (!deletedAccount) {
      return NextResponse.json(
        { success: false, message: "Failed to delete account" },
        { status: 500 }
      );
    }

    await OwnerModel.findByIdAndDelete(owner._id);
    await InvoiceModel.deleteMany({ owner: owner._id });
    await FeedbackModel.deleteMany({ givenTo: owner._id });

    return NextResponse.json(
      { success: true, message: "Account deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
