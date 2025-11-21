"use server";

import OwnerModel from "@/models/owner";
import InvoiceModel from "@/models/invoice";
import dbConnect from "@/lib/db-connect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function deleteCoupon(invoiceId) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    const username = session?.user?.username;

    if (!username || !invoiceId) {
      return {
        success: false,
        message: "Username and invoiceId are required",
      };
    }

    const owner = await OwnerModel.findOne({ username });
    if (!owner) {
      return { success: false, message: "Owner not found" };
    }

    // Find the invoice and update its coupon status
    const invoice = await InvoiceModel.findOne({
      invoiceId: invoiceId,
      owner: owner._id,
    });
    if (!invoice || !invoice.couponAttached) {
      return { success: false, message: "Invoice or coupon not found" };
    }

    invoice.couponAttached.isCouponUsed = true;
    await invoice.save();

    return {
      success: true,
      message: "Coupon marked as used successfully",
    };
  } catch (error) {
    console.error("Error updating coupon status:", error);
    return { success: false, message: "Internal Server Error" };
  }
}

