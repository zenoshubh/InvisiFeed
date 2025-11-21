import mongoose, { Schema } from "mongoose";

const FeedbackSchema = new Schema({
  givenTo: {
    type: Schema.Types.ObjectId,
    ref: "Owner",
    required: true,
  },
  invoiceId: {
    type: Schema.Types.ObjectId,
    ref: "Invoice",
    default: null,
  },
  satisfactionRating: {
    type: Number,
    required: true,
  },
  communicationRating: {
    type: Number,
    required: true,
  },
  qualityOfServiceRating: {
    type: Number,
    required: true,
  },
  valueForMoneyRating: {
    type: Number,
    required: true,
  },
  recommendRating: {
    type: Number,
    required: true,
  },
  overAllRating: {
    type: Number,
    required: true,
  },
  feedbackContent: {
    type: String,
    trim: true,
  },
  suggestionContent: {
    type: String,
    trim: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const FeedbackModel =
  mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);

export default FeedbackModel;
