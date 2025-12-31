import mongoose, { Schema } from "mongoose";

const AnalyticsSnapshotSchema = new Schema(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    snapshotDate: {
      type: Date,
      required: true,
      index: true,
    },
    periodType: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      required: true,
      index: true,
    },
    metrics: {
      totalSales: {
        type: Number,
        default: 0,
      },
      totalInvoices: {
        type: Number,
        default: 0,
      },
      totalFeedbacks: {
        type: Number,
        default: 0,
      },
      averageRating: {
        type: Number,
        default: 0,
      },
      feedbackRatio: {
        type: Number,
        default: 0,
      },
      positivePercentage: {
        type: Number,
        default: 0,
      },
      averageResponseTime: {
        type: Number,
        default: 0,
      },
      ratingsBreakdown: {
        satisfactionRating: { type: Number, default: 0 },
        communicationRating: { type: Number, default: 0 },
        qualityOfServiceRating: { type: Number, default: 0 },
        valueForMoneyRating: { type: Number, default: 0 },
        recommendRating: { type: Number, default: 0 },
        overAllRating: { type: Number, default: 0 },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Performance Indexes - Critical for fast dashboard loads
AnalyticsSnapshotSchema.index(
  { business: 1, periodType: 1, snapshotDate: -1 },
  { unique: true }
);
AnalyticsSnapshotSchema.index({ business: 1, snapshotDate: -1 });
AnalyticsSnapshotSchema.index({ periodType: 1, snapshotDate: -1 });

const AnalyticsSnapshotModel =
  mongoose.models.AnalyticsSnapshot ||
  mongoose.model("AnalyticsSnapshot", AnalyticsSnapshotSchema);

export default AnalyticsSnapshotModel;

