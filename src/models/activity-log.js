import mongoose, { Schema } from "mongoose";

const ActivityLogSchema = new Schema(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    actionType: {
      type: String,
      enum: [
        "invoice_created",
        "invoice_uploaded",
        "invoice_sent",
        "feedback_submitted",
        "plan_upgraded",
        "plan_downgraded",
        "plan_trial_started",
        "profile_updated",
        "data_reset",
        "account_deleted",
        "coupon_created",
        "coupon_used",
        "payment_completed",
        "payment_failed",
      ],
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      enum: [
        "Invoice",
        "Feedback",
        "Subscription",
        "Payment",
        "Coupon",
        "Customer",
        "User",
      ],
      default: null,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Performance Indexes
ActivityLogSchema.index({ business: 1, createdAt: -1 });
ActivityLogSchema.index({ actionType: 1, createdAt: -1 });
ActivityLogSchema.index({ entityType: 1, entityId: 1 });
ActivityLogSchema.index({ createdAt: -1 });
// Compound index for common query: find by business + actionType, sorted by createdAt
ActivityLogSchema.index({ business: 1, actionType: 1, createdAt: -1 });
// TTL index: Auto-delete logs older than 90 days (7,776,000 seconds)
ActivityLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 }
);

const ActivityLogModel =
  mongoose.models.ActivityLog ||
  mongoose.model("ActivityLog", ActivityLogSchema);

export default ActivityLogModel;

