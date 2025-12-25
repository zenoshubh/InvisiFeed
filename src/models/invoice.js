import mongoose, { Schema } from "mongoose";

const InvoiceSchema = new Schema(
  {
    invoiceId: {
      type: String,
      required: true,
      trim: true,
    },
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
    // Keep customerDetails for backward compatibility and when customer is not created
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
    coupon: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },
    mergedPdfUrl: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: ["draft", "sent", "viewed", "feedback_submitted", "archived"],
      default: "draft",
      index: true,
    },
    AIuseCount: {
      type: Number,
      default: 0,
    },
    isFeedbackSubmitted: {
      type: Boolean,
      default: false,
      index: true,
    },
    feedbackSubmittedAt: {
      type: Date,
      default: null,
    },
    updatedRecommendedActions: {
      type: Boolean,
      default: false,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    viewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Performance Indexes
InvoiceSchema.index({ invoiceId: 1, business: 1 }, { unique: true });
InvoiceSchema.index({ business: 1, createdAt: -1 });
InvoiceSchema.index({ business: 1, status: 1 });
InvoiceSchema.index({ business: 1, isFeedbackSubmitted: 1 });
// Compound index for common query: find by business + status, sorted by createdAt
InvoiceSchema.index({ business: 1, status: 1, createdAt: -1 });
// Text index for invoiceId search (for regex/text search queries)
// Note: Text indexes must be separate, cannot combine with regular fields
InvoiceSchema.index({ invoiceId: "text" });
InvoiceSchema.index({ customer: 1 });
InvoiceSchema.index({ coupon: 1 });
InvoiceSchema.index({ createdAt: -1 });

const InvoiceModel =
  mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);

export default InvoiceModel;

