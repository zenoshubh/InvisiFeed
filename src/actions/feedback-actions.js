"use server";

import dbConnect from "@/lib/dbConnect";
import InvoiceModel from "@/models/Invoice";
import OwnerModel from "@/models/Owner";
import FeedbackModel from "@/models/Feedback";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function checkInvoiceValidity(username, invoiceNumber) {
  await dbConnect();
  try {
    const owner = await OwnerModel.findOne({ username });

    if (!owner) {
      return {
        success: false,
        message: "Business not found",
        businessName: null,
      };
    }

    const invoice = await InvoiceModel.findOne({
      invoiceId: invoiceNumber,
      owner: owner._id,
    });

    if (!invoice) {
      return {
        success: false,
        message: "Invalid invoice",
        businessName: owner.businessName,
      };
    }

    const feedbackSubmitted = await FeedbackModel.findOne({
      invoiceId: invoice._id,
    });

    if (feedbackSubmitted) {
      return {
        success: false,
        message: "Feedback already submitted for this invoice",
        businessName: owner.businessName,
        alreadySubmitted: true,
      };
    }

    return {
      success: true,
      message: "Invoice is valid",
      businessName: owner.businessName,
      aiUsageCount: invoice.AIuseCount || 0,
    };
  } catch (error) {
    console.error("Error checking invoice validity:", error);
    return { success: false, message: "Internal server error" };
  }
}

export async function generateFeedbackWithAI(
  formData,
  username,
  invoiceNumber
) {
  await dbConnect();
  try {
    const owner = await OwnerModel.findOne({ username });

    if (!owner) {
      return { success: false, message: "Business not found" };
    }

    const invoice = await InvoiceModel.findOne({
      invoiceId: invoiceNumber,
      owner: owner._id,
    });

    if (!invoice) {
      return { success: false, message: "Invoice not found" };
    }

    if (invoice.AIuseCount >= 3) {
      return {
        success: false,
        message: "AI usage limit reached for this invoice",
      };
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

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });
    const result = await model.generateContent(prompt);
    const feedback = result.response.text();

    // Update AI usage count
    invoice.AIuseCount += 1;
    await invoice.save();

    return {
      success: true,
      message: "Feedback generated successfully",
      feedback,
      aiUsageCount: invoice.AIuseCount,
    };
  } catch (error) {
    console.error("Error generating feedback:", error);
    return { success: false, message: "Failed to generate feedback" };
  }
}

export async function generateSuggestionsWithAI(
  formData,
  username,
  invoiceNumber
) {
  await dbConnect();
  try {
    const owner = await OwnerModel.findOne({ username });

    if (!owner) {
      return { success: false, message: "Business not found" };
    }

    const invoice = await InvoiceModel.findOne({
      invoiceId: invoiceNumber,
      owner: owner._id,
    });

    if (!invoice) {
      return { success: false, message: "Invoice not found" };
    }

    if (invoice.AIuseCount >= 3) {
      return { success: false, message: "AI usage limit reached" };
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

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });
    const result = await model.generateContent(prompt);
    const suggestions = result.response.text();

    invoice.AIuseCount += 1;
    await invoice.save();

    return {
      success: true,
      message: "Suggestions generated successfully",
      suggestions,
      aiUsageCount: invoice.AIuseCount,
    };
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return { success: false, message: "Failed to generate suggestions" };
  }
}

export async function submitFeedback(formData, username, invoiceNumber) {
  await dbConnect();
  try {
    const owner = await OwnerModel.findOne({ username });

    if (!owner) {
      return { success: false, message: "Business not found" };
    }

    const invoice = await InvoiceModel.findOne({
      invoiceId: invoiceNumber,
      owner: owner._id,
    });

    if (!invoice) {
      return { success: false, message: "Invoice not found" };
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
        givenTo: owner._id,
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
        givenTo: owner._id,
        invoiceId: invoice._id,
      });
    }

    await feedback.save();

    invoice.isFeedbackSubmitted = true;
    invoice.feedbackSubmittedAt = new Date();
    await invoice.save();

    owner.feedbacks.push(feedback._id);
    await owner.save();

    // Generate coupon code if needed
    const couponCode = `THANK${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    return {
      success: true,
      message: "Feedback submitted successfully",
      couponCode,
      couponDiscount: 10,
    };
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return { success: false, message: "Failed to submit feedback" };
  }
}
