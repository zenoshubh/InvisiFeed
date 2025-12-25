import mongoose, { Schema } from "mongoose";

const SubscriptionSchema = new Schema(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    planType: {
      type: String,
      enum: ["free", "pro", "pro-trial"],
      required: true,
      default: "free",
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      required: true,
      default: "active",
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: false,
      default: null,
      index: true,
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancellationReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Performance Indexes
SubscriptionSchema.index({ business: 1, status: 1 });
SubscriptionSchema.index({ business: 1, planType: 1 });
SubscriptionSchema.index({ business: 1, endDate: 1 });
SubscriptionSchema.index({ status: 1, endDate: 1 }); // For CRON jobs
SubscriptionSchema.index({ createdAt: -1 });

const SubscriptionModel =
  mongoose.models.Subscription ||
  mongoose.model("Subscription", SubscriptionSchema);

export default SubscriptionModel;

