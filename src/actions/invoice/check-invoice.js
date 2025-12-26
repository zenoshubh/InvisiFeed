"use server";

import dbConnect from "@/lib/db-connect";
import AccountModel from "@/models/account";
import BusinessModel from "@/models/business";
import InvoiceModel from "@/models/invoice";

export async function checkInvoice(username, invoiceNumber, couponCode = null) {
  await dbConnect();

  try {
    if (!username || !invoiceNumber) {
      return { success: false, message: "Missing required parameters" };
    }

    // Find account by username
    const account = await AccountModel.findOne({ username }).lean();

    if (!account) {
      return { success: false, message: "Invoice Provider not found" };
    }

    // Find business by account
    const business = await BusinessModel.findOne({
      account: account._id,
    }).lean();

    if (!business) {
      return { success: false, message: "Business not found" };
    }

    // Find invoice entry
    const query = {
      invoiceId: invoiceNumber,
      business: business._id,
    };

    // Add coupon code to query if provided
    if (couponCode) {
      query["couponAttached.couponCode"] = couponCode;
    }

    let invoice = await InvoiceModel.findOne(query).lean();

    if (!invoice) {
      return { success: false, message: "Invoice not found" };
    }

    if (invoice && invoice.isFeedbackSubmitted) {
      return {
        success: false,
        message: "Feedback already submitted",
        data: {
          alreadySubmitted: true,
          businessName: business.businessName,
        },
      };
    }

    // Merge account and business for backward compatibility
    const mergedBusiness = {
      ...account,
      ...business,
      _id: business._id,
    };

    return {
      success: true,
      message: "Invoice Number and Username verified",
      data: {
        business: mergedBusiness,
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

