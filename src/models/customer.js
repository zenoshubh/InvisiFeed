import mongoose, { Schema } from "mongoose";

const CustomerSchema = new Schema(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      required: false,
      trim: true,
      default: null,
    },
    phoneNumber: {
      type: String,
      required: false,
      trim: true,
      default: null,
    },
    totalInvoices: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    lastInvoiceDate: {
      type: Date,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Performance Indexes
// Sparse index allows multiple null emails (unique constraint only applies to non-null values)
CustomerSchema.index(
  { business: 1, customerEmail: 1 },
  { unique: true, sparse: true }
);
CustomerSchema.index({ business: 1, createdAt: -1 });
CustomerSchema.index({ business: 1, totalSpent: -1 });
CustomerSchema.index({ customerEmail: 1 });

const CustomerModel =
  mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);

export default CustomerModel;

