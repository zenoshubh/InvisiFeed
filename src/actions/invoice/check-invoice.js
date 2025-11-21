"use server";

import dbConnect from "@/lib/db-connect";
import OwnerModel from "@/models/owner";
import InvoiceModel from "@/models/invoice";

export async function checkInvoice(username, invoiceNumber, couponCode = null) {
  await dbConnect();

  try {
    if (!username || !invoiceNumber) {
      return { success: false, message: "Missing required parameters" };
    }

    const owner = await OwnerModel.findOne({ username });

    if (!owner) {
      return { success: false, message: "Invoice Provider not found" };
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
      return { success: false, message: "Invoice not found" };
    }

    if (invoice && invoice.isFeedbackSubmitted) {
      return {
        success: false,
        message: "Feedback already submitted",
        data: {
          alreadySubmitted: true,
          businessName: owner.businessName,
        },
      };
    }

    return {
      success: true,
      message: "Invoice Number and Username verified",
      data: {
        owner,
        invoice,
      },
    };
  } catch (error) {
    console.error("Error in check-invoice:", error);
    return {
      success: false,
      message: error.message || "Internal server error",
    };
  }
}

