import mongoose, { Schema } from "mongoose";

const InvoiceEmailSchema = new Schema(
  {
    invoice: {
      type: Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
    },
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    recipientEmail: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    sentAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    deliveryStatus: {
      type: String,
      enum: ["sent", "delivered", "bounced", "failed"],
      default: "sent",
    },
    openedAt: {
      type: Date,
      default: null,
    },
    openedCount: {
      type: Number,
      default: 0,
    },
    clickedAt: {
      type: Date,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Performance Indexes
InvoiceEmailSchema.index({ invoice: 1 });
InvoiceEmailSchema.index({ business: 1, sentAt: -1 });
// Compound index for common query: find by business + deliveryStatus, sorted by sentAt
InvoiceEmailSchema.index({ business: 1, deliveryStatus: 1, sentAt: -1 });
InvoiceEmailSchema.index({ recipientEmail: 1 });
InvoiceEmailSchema.index({ deliveryStatus: 1 });
InvoiceEmailSchema.index({ sentAt: -1 });

const InvoiceEmailModel =
  mongoose.models.InvoiceEmail ||
  mongoose.model("InvoiceEmail", InvoiceEmailSchema);

export default InvoiceEmailModel;

