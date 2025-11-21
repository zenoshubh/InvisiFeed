"use server";

import dbConnect from "@/lib/db-connect";
import OwnerModel from "@/models/owner";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import FeedbackModel from "@/models/feedback";
import InvoiceModel from "@/models/invoice";

export async function resetData() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const username = session?.user?.username;

    if (!username) {
      return { success: false, message: "Unauthorized" };
    }

    const owner = await OwnerModel.findOne({ username });
    if (!owner) {
      return { success: false, message: "Owner not found" };
    }

    // Reset data
    owner.currentRecommendedActions = {
      improvements: [],
      strengths: [],
    };

    await FeedbackModel.deleteMany({
      givenTo: owner._id,
    });

    owner.feedbacks = [];

    await InvoiceModel.deleteMany({ owner: owner._id });

    await owner.save();

    return {
      success: true,
      message: "Data reset successfully",
    };
  } catch (error) {
    console.error("Error resetting data:", error);
    return { success: false, message: "Internal server error" };
  }
}

export async function deleteAccount() {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return { success: false, message: "Unauthorized" };
    }

    const owner = await OwnerModel.findOne({ email: session.user.email });
    if (!owner) {
      return { success: false, message: "Owner not found" };
    }

    const DeletedAccountModel = (await import("@/models/deleted-account"))
      .default;

    const deletedAccount = await DeletedAccountModel.create({
      email: owner.email,
      deletionDate: new Date(),
    });

    if (!deletedAccount) {
      return { success: false, message: "Failed to delete account" };
    }

    await OwnerModel.findByIdAndDelete(owner._id);
    await InvoiceModel.deleteMany({ owner: owner._id });
    await FeedbackModel.deleteMany({ givenTo: owner._id });

    return { success: true, message: "Account deleted successfully" };
  } catch (error) {
    console.error("Error deleting account:", error);
    return { success: false, message: "Internal server error" };
  }
}

