"use server";

import OwnerModel from "@/models/owner";
import InvoiceModel from "@/models/invoice";
import dbConnect from "@/lib/db-connect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function getCoupons() {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    const username = session?.user?.username;

    if (!username) {
      return { success: false, message: "Unauthorized" };
    }

    const owner = await OwnerModel.findOne({ username });
    if (!owner) {
      return { success: false, message: "Owner not found" };
    }

    const invoices = await InvoiceModel.find({ owner: owner._id });

    // Extract all coupons from invoices
    const coupons = invoices
      .filter(
        (invoice) =>
          invoice?.couponAttached?.isCouponUsed === false &&
          invoice?.couponAttached?.couponExpiryDate > Date.now()
      ) // Only get invoices with coupons
      .map((invoice) => ({
        invoiceId: invoice.invoiceId,
        couponCode: invoice.couponAttached.couponCode,
        description: invoice.couponAttached.couponDescription,
        expiryDate: invoice.couponAttached.couponExpiryDate,
        isUsed: invoice.couponAttached.isCouponUsed,
      }));

    return {
      success: true,
      message: "Coupons fetched successfully",
      data: {
        coupons,
      },
    };
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return { success: false, message: "Internal Server Error" };
  }
}

