import { NextResponse } from "next/server";
import OwnerModel from "@/models/owner";
import InvoiceModel from "@/models/invoice";
import dbConnect from "@/lib/db-connect";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function DELETE(req) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    const username = session?.user?.username;
    const { invoiceId } = await req.json();

    if (!username || !invoiceId) {
      return NextResponse.json(
        { success: false, message: "Username and invoiceId are required" },
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

    // Find the invoice and update its coupon status
    const invoice = await InvoiceModel.findOne({
      invoiceId: invoiceId,
      owner: owner._id,
    });
    if (!invoice || !invoice.couponAttached) {
      return NextResponse.json(
        { success: false, message: "Invoice or coupon not found" },
        { status: 404 }
      );
    }

    invoice.couponAttached.isCouponUsed = true;
    await invoice.save();

    return NextResponse.json(
      { success: true, message: "Coupon marked as used successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating coupon status:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
