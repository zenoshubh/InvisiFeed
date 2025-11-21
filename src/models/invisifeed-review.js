import mongoose, { Schema } from "mongoose";

const InvisifeedReviewSchema = new Schema({
  review: {
    type: String,
    required: true,
  },
}, {timestamps:true});

const InvisifeedReviewModel =
  mongoose.models.InvisifeedReview || mongoose.model("InvisifeedReview", InvisifeedReviewSchema);

export default InvisifeedReviewModel;
  