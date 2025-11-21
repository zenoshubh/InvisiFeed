import dbConnect from "@/lib/db-connect";
import OwnerModel from "@/models/owner";
import InvoiceModel from "@/models/invoice";
import { NextResponse } from "next/server";

export async function GET(req) {
  await dbConnect();

  try {
    const URLParams = req.nextUrl.searchParams;

    const username = URLParams.get("username");
    const invoiceNumber = URLParams.get("invoiceNumber");
    const couponCode = URLParams.get("couponCode");

    if (!username || !invoiceNumber) {
      return NextResponse.json(
        { success: false, message: "Missing required parameters" },
        { status: 400 }
      );
    }

    const owner = await OwnerModel.findOne({ username });

    if (!owner) {
      return NextResponse.json(
        { success: false, message: "Invoice Provider not found" },
        { status: 404 }
      );
    }

    // Find invoice entry
    const query = {
      invoiceId: invoiceNumber,
      owner: owner._id,
    };

    // Add coupon code to query if provided
    if (couponCode) {
      query["couponAttached.couponCode"] = couponCode;
    }

    let invoice = await InvoiceModel.findOne(query);

    if (!invoice) {
      return NextResponse.json(
        { success: false, message: "Invoice not found" },
        { status: 404 }
      );
    }

    if (invoice && invoice.isFeedbackSubmitted) {
      return NextResponse.json(
        { success: false, message: "Feedback already submitted" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Invoice Number and Username verified",
        data: {
          owner,
          invoice,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in check-invoice route:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
