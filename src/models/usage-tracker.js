import mongoose, { Schema } from "mongoose";

const UsageTrackerSchema = new Schema(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    // Usage Type: 'invoice-upload' for daily counter, 'ai-usage' for individual events
    usageType: {
      type: String,
      enum: [
        "invoice-upload", // Daily counter (one doc per business)
        "ai-feedback-generation",
        "ai-suggestion-generation",
        "ai-recommended-actions",
      ],
      required: true,
      index: true,
    },
    // For invoice upload: daily counter tracking
    dailyUploadCount: {
      type: Number,
      default: 0,
    },
    lastDailyReset: {
      type: Date,
      default: Date.now,
    },
    // For AI usage: invoice reference
    invoice: {
      type: Schema.Types.ObjectId,
      ref: "Invoice",
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Performance Indexes
// Unique index for invoice-upload (one per business)
UsageTrackerSchema.index(
  { business: 1, usageType: 1 },
  {
    unique: true,
    partialFilterExpression: { usageType: "invoice-upload" },
  }
);
UsageTrackerSchema.index({ business: 1, createdAt: -1 });
UsageTrackerSchema.index({ business: 1, usageType: 1 });
UsageTrackerSchema.index({ invoice: 1 });
UsageTrackerSchema.index({ lastDailyReset: 1 });
// TTL index for AI usage events: Auto-delete AI usage events older than 6 months (15,552,000 seconds)
// Note: This only applies to AI usage events, not invoice-upload counter
UsageTrackerSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 180 * 24 * 60 * 60,
    partialFilterExpression: {
      usageType: { $in: ["ai-feedback-generation", "ai-suggestion-generation", "ai-recommended-actions"] },
    },
  }
);

const UsageTrackerModel =
  mongoose.models.UsageTracker ||
  mongoose.model("UsageTracker", UsageTrackerSchema);

export default UsageTrackerModel;

