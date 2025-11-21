import mongoose, { Schema } from "mongoose";

const CouponSchema = new Schema({
  couponCode: {
    type: String,
    required: true,
    default: null,
    trim: true,
    match: [
      /^[A-Z0-9]+$/,
      "Coupon code must contain only uppercase letters and numbers",
    ],
  },
  couponDescription: {
    type: String,
    required: true,
    default: null,
    trim: true,
  },
  couponExpiryDate: {
    type: Date,
    required: true,
    default: null,
  },
  isCouponUsed: {
    type: Boolean,
    default: false,
  },
  couponCreatedAt: {
    type: Date,
    default: Date.now,
  },
});

const InvoiceSchema = new Schema({
  invoiceId: {
    type: String,
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "Owner",
    required: true,
  },
  customerDetails: {
    customerName: {
      type: String,
      trim: true,
      default: null,
    },
    customerEmail: {
      type: String,
      trim: true,
      default: null,
    },
    amount: {
      type: Number,
      default: null,
    },
  },
  mergedPdfUrl: {
    type: String,
    // required: true,
    trim: true,
    default: null,
  },
  AIuseCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isFeedbackSubmitted: {
    type: Boolean,
    default: false,
  },
  feedbackSubmittedAt: {
    type: Date,
    default: null,
  },
  updatedRecommendedActions: {
    type: Boolean,
    default: false,
  },
  couponAttached: {
    type: CouponSchema,
    default: null,
  },
});

InvoiceSchema.index({ invoiceId: 1, owner: 1 }, { unique: true });

const InvoiceModel =
  mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);

export default InvoiceModel;
