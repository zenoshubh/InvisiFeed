import mongoose, { Schema } from "mongoose";

const PaymentSchema = new Schema(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    subscription: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
      default: null,
      index: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      required: false,
      default: null,
      index: true,
    },
    razorpaySignature: {
      type: String,
      required: false,
      default: null,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      required: true,
      default: "pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Performance Indexes
PaymentSchema.index({ business: 1, createdAt: -1 });
PaymentSchema.index({ business: 1, status: 1 });
PaymentSchema.index({ subscription: 1 });
PaymentSchema.index({ razorpayOrderId: 1 });
PaymentSchema.index({ razorpayPaymentId: 1 });
PaymentSchema.index({ status: 1, createdAt: -1 });

const PaymentModel =
  mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);

export default PaymentModel;

