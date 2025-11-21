"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/db-connect";
import OwnerModel from "@/models/owner";
import InvoiceModel from "@/models/invoice";
import FeedbackModel from "@/models/feedback";
import DeletedAccountModel from "@/models/deleted-account";

export async function deleteUserAccount() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { success: false, message: "Unauthorized" };
    }

    await dbConnect();

    const owner = await OwnerModel.findOne({ email: session.user.email });
    if (!owner) {
      return { success: false, message: "Owner not found" };
    }

    // Create deleted account record
    const deletedAccount = await DeletedAccountModel.create({
      email: owner.email,
      deletionDate: new Date(),
    });

    if (!deletedAccount) {
      return { success: false, message: "Failed to process account deletion" };
    }

    // Delete all related data
    await Promise.all([
      OwnerModel.findByIdAndDelete(owner._id),
      InvoiceModel.deleteMany({ owner: owner._id }),
      FeedbackModel.deleteMany({ givenTo: owner._id }),
    ]);

    return { success: true, message: "Account deleted successfully" };
  } catch (error) {
    console.error("Account deletion error:", error);
    return { success: false, message: "Account deletion failed" };
  }
}
