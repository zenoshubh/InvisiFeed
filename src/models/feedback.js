import mongoose, { Schema } from "mongoose";

const FeedbackSchema = new Schema(
  {
    givenTo: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    invoice: {
      type: Schema.Types.ObjectId,
      ref: "Invoice",
      default: null,
      index: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
    // Keep invoiceId for backward compatibility
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: "Invoice",
      default: null,
    },
    satisfactionRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    communicationRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    qualityOfServiceRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    valueForMoneyRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    recommendRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    overAllRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      index: true,
    },
    feedbackContent: {
      type: String,
      trim: true,
    },
    suggestionContent: {
      type: String,
      trim: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
      index: true,
    },
    sentiment: {
      type: String,
      enum: ["positive", "neutral", "negative"],
      default: null,
    },
    responseTime: {
      type: Number, // Hours between invoice sent and feedback
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Performance Indexes
FeedbackSchema.index({ givenTo: 1, createdAt: -1 });
FeedbackSchema.index({ invoice: 1 });
FeedbackSchema.index({ givenTo: 1, isAnonymous: 1 });
FeedbackSchema.index({ givenTo: 1, overAllRating: 1 });
FeedbackSchema.index({ createdAt: -1 });

const FeedbackModel =
  mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);

export default FeedbackModel;

