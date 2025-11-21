import dbConnect from "@/lib/db-connect";
import InvoiceModel from "@/models/invoice";
import OwnerModel from "@/models/owner";
import { NextResponse } from "next/server";
import FeedbackModel from "@/models/feedback";

export async function POST(req) {
  await dbConnect();

  const { formData, username, invoiceNumber } = await req.json();



  try {
    const owner = await OwnerModel.findOne({ username: username });

    if (!owner) {
      return NextResponse.json(
        { success: false, message: "Business not found" },
        { status: 404 }
      );
    }

    // Find the invoice index
    const invoice = await InvoiceModel.findOne({
      invoiceId: invoiceNumber,
      owner: owner._id,
    });

    if (!invoice) {
      return NextResponse.json(
        { success: false, message: "Invoice not found" },
        { status: 404 }
      );
    }

    const {
      satisfactionRating,
      communicationRating,
      qualityOfServiceRating,
      valueForMoneyRating,
      recommendRating,
      overAllRating,
      feedbackContent,
      suggestionContent,
      anonymousFeedback,
    } = formData;


    let feedback = null;
    // Add the new feedback to the owner's feedbacks array
    if (anonymousFeedback) {
      feedback = await FeedbackModel.create({
        satisfactionRating,
        communicationRating,
        qualityOfServiceRating,
        valueForMoneyRating,
        recommendRating,
        overAllRating,
        feedbackContent,
        suggestionContent,
        givenTo: owner._id,
      });
      await feedback.save();
    } else {
      feedback = await FeedbackModel.create({
        satisfactionRating,
        communicationRating,
        qualityOfServiceRating,
        valueForMoneyRating,
        recommendRating,
        overAllRating,
        feedbackContent,
        suggestionContent,
        givenTo: owner._id,
        invoiceId: invoice._id,
      });
      await feedback.save();
    }

    // Set the feedback submitted flag on the specific invoice
    invoice.isFeedbackSubmitted = true;
    invoice.feedbackSubmittedAt = new Date();
    await invoice.save();

    owner.feedbacks.push(feedback._id);
    await owner.save();

    return NextResponse.json(
      { success: true, message: "Feedback submitted successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
