import mongoose, { Schema } from "mongoose";

const PlatformReviewSchema = new Schema(
  {
    review: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Performance Indexes
PlatformReviewSchema.index({ createdAt: -1 });

const PlatformReviewModel =
  mongoose.models.PlatformReview ||
  mongoose.model("PlatformReview", PlatformReviewSchema);

export default PlatformReviewModel;

