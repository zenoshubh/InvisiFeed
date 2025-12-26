"use server";

import dbConnect from "@/lib/db-connect";
import InvoiceModel from "@/models/invoice";
import FeedbackModel from "@/models/feedback";
import { getGenerativeModel } from "@/lib/google-ai";
import AccountModel from "@/models/account";
import BusinessModel from "@/models/business";
import { successResponse, errorResponse } from "@/utils/response";

export async function checkInvoiceValidity(username, invoiceNumber) {
  await dbConnect();
  try {
    // Find account by username
    const account = await AccountModel.findOne({ username }).lean();

    if (!account) {
      return errorResponse("Business not found", {
        businessName: null,
      });
    }

    // Find business by account
    const business = await BusinessModel.findOne({
      account: account._id,
    }).lean();

    if (!business) {
      return errorResponse("Business not found", {
        businessName: null,
      });
    }

    const invoice = await InvoiceModel.findOne({
      invoiceId: invoiceNumber,
      business: business._id,
    }).lean();

    if (!invoice) {
      return errorResponse("Invalid invoice", {
        businessName: business.businessName,
      });
    }

    const feedbackSubmitted = await FeedbackModel.findOne({
      invoice: invoice._id,
    }).lean();

    if (feedbackSubmitted) {
      return errorResponse("Feedback already submitted for this invoice", {
        businessName: business.businessName,
        alreadySubmitted: true,
      });
    }

    return successResponse("Invoice is valid", {
      businessName: business.businessName,
      aiUsageCount: invoice.AIuseCount || 0,
    });
  } catch (error) {
    console.error("Error checking invoice validity:", error);
    return errorResponse("Internal server error");
  }
}

export async function generateFeedbackWithAI(
  formData,
  username,
  invoiceNumber
) {
  await dbConnect();
  try {
    // Find account by username
    const account = await AccountModel.findOne({ username }).lean();

    if (!account) {
      return errorResponse("Business not found");
    }

    // Find business by account
    const business = await BusinessModel.findOne({
      account: account._id,
    }).lean();

    if (!business) {
      return errorResponse("Business not found");
    }

    const invoice = await InvoiceModel.findOne({
      invoiceId: invoiceNumber,
      business: business._id,
    });

    if (!invoice) {
      return errorResponse("Invoice not found");
    }

    if (invoice.AIuseCount >= 3) {
      return errorResponse("AI usage limit reached for this invoice");
    }

    let prompt = `
      Overall Satisfaction: ${formData.satisfactionRating}/5,
      Communication: ${formData.communicationRating}/5,
      Quality of Service: ${formData.qualityOfServiceRating}/5,
      Value for Money: ${formData.valueForMoneyRating}/5,
      Likelihood to Recommend: ${formData.recommendRating}/5,
      Overall Rating: ${formData.overAllRating}/5
    `;

    if (formData.feedbackContent && formData.feedbackContent.trim() !== "") {
      prompt += `
      
      User's Feedback: "${formData.feedbackContent}"
      
      Based on these ratings and the user's feedback, write a personal 50-word feedback in first person ("I" perspective) that sounds natural and authentic. Include specific details from their feedback while maintaining their tone and sentiment. Make it sound like a real customer sharing their experience.`;
    } else {
      prompt += `
      
      Write a personal 30-word feedback in first person ("I" perspective) based on these ratings. Make it sound natural and authentic, like a real customer sharing their experience. Include specific details about what they liked or what could be better. The character count of response in the range 100-200, strictly not above 500. Give response as plain text, no text decoration, starting or ending quotation marks, or formatting.`;
    }

    const model = getGenerativeModel("gemini-2.0-flash");
    const result = await model.generateContent(prompt);
    const feedback = result.response.text();

    // Update AI usage count
    invoice.AIuseCount += 1;
    await invoice.save();

    return successResponse("Feedback generated successfully", {
      feedback,
      aiUsageCount: invoice.AIuseCount,
    });
  } catch (error) {
    console.error("Error generating feedback:", error);
    return errorResponse("Failed to generate feedback");
  }
}

export async function generateSuggestionsWithAI(
  formData,
  username,
  invoiceNumber
) {
  await dbConnect();
  try {
    // Find account by username
    const account = await AccountModel.findOne({ username }).lean();

    if (!account) {
      return errorResponse("Business not found");
    }

    // Find business by account
    const business = await BusinessModel.findOne({
      account: account._id,
    }).lean();

    if (!business) {
      return errorResponse("Business not found");
    }

    const invoice = await InvoiceModel.findOne({
      invoiceId: invoiceNumber,
      business: business._id,
    });

    if (!invoice) {
      return errorResponse("Invoice not found");
    }

    if (invoice.AIuseCount >= 3) {
      return errorResponse("AI usage limit reached");
    }

    let prompt = `Based on these ratings:
      Overall Satisfaction: ${formData.satisfactionRating}/5,
      Communication: ${formData.communicationRating}/5,
      Quality of Service: ${formData.qualityOfServiceRating}/5,
      Value for Money: ${formData.valueForMoneyRating}/5,
      Likelihood to Recommend: ${formData.recommendRating}/5`;

    if (formData.feedbackContent && formData.feedbackContent.trim() !== "") {
      prompt += `\n\nUser's Feedback: "${formData.feedbackContent}"`;
    }

    prompt += `\n\nProvide 2-3 specific, actionable suggestions for improvement in first person ("I suggest" or "I would recommend"). Keep each suggestion concise (max 30 words). Make them constructive and helpful. Response should be 150-250 characters. Plain text only, no formatting.`;

    const model = getGenerativeModel("gemini-2.0-flash");
    const result = await model.generateContent(prompt);
    const suggestions = result.response.text();

    invoice.AIuseCount += 1;
    await invoice.save();

    return successResponse("Suggestions generated successfully", {
      suggestions,
      aiUsageCount: invoice.AIuseCount,
    });
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return errorResponse("Failed to generate suggestions");
  }
}

export async function submitFeedback(formData, username, invoiceNumber) {
  await dbConnect();
  try {
    // Find account by username
    const account = await AccountModel.findOne({ username }).lean();

    if (!account) {
      return errorResponse("Business not found");
    }

    // Find business by account (need document for saving feedback, but check first)
    const businessCheck = await BusinessModel.findOne({
      account: account._id,
    })
      .select("_id")
      .lean();

    if (!businessCheck) {
      return errorResponse("Business not found");
    }

    // Get business document for saving (we need to update invoice)
    const business = await BusinessModel.findById(businessCheck._id);
    const invoice = await InvoiceModel.findOne({
      invoiceId: invoiceNumber,
      business: business._id,
    });

    if (!invoice) {
      return errorResponse("Invoice not found");
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
        givenTo: business._id,
        isAnonymous: true,
      });
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
        givenTo: business._id,
        invoice: invoice._id,
        invoiceId: invoice._id, // Keep for backward compatibility
        isAnonymous: false,
      });
    }

    invoice.isFeedbackSubmitted = true;
    invoice.feedbackSubmittedAt = new Date();
    await invoice.save();

    // Look up coupon from invoice if it exists
    let couponCode = null;
    
    if (invoice.coupon) {
      const CouponModel = (await import("@/models/coupon")).default;
      const coupon = await CouponModel.findById(invoice.coupon)
        .select("couponCode")
        .lean();
      
      if (coupon) {
        couponCode = coupon.couponCode;
      }
    }

    // If no coupon found, generate a default thank you code
    if (!couponCode) {
      couponCode = `THANK${Math.random()
        .toString(36)
        .substr(2, 9)
        .toUpperCase()}`;
    }

    return successResponse("Feedback submitted successfully", {
      couponCode,
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return errorResponse("Failed to submit feedback");
  }
}
