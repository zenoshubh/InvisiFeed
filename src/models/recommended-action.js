import mongoose, { Schema } from "mongoose";

const RecommendedActionSchema = new Schema(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    invoice: {
      type: Schema.Types.ObjectId,
      ref: "Invoice",
      default: null,
    },
    improvements: {
      type: [String],
      required: true,
      default: [],
    },
    strengths: {
      type: [String],
      required: true,
      default: [],
    },
    generatedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Performance Indexes
RecommendedActionSchema.index({ business: 1, isActive: 1 });
RecommendedActionSchema.index({ business: 1, generatedAt: -1 });
RecommendedActionSchema.index({ invoice: 1 });

const RecommendedActionModel =
  mongoose.models.RecommendedAction ||
  mongoose.model("RecommendedAction", RecommendedActionSchema);

export default RecommendedActionModel;

