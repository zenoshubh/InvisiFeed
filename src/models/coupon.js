import mongoose, { Schema } from "mongoose";

const CouponSchema = new Schema(
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
    couponCode: {
      type: String,
      required: true,
      trim: true,
      match: [
        /^[A-Z0-9]+$/,
        "Coupon code must contain only uppercase letters and numbers",
      ],
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
      index: true,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    maxUsage: {
      type: Number,
      default: 1, // Default to single use
    },
  },
  {
    timestamps: true,
  }
);

// Performance Indexes
CouponSchema.index({ business: 1, isActive: 1, expiryDate: 1 });
// Compound index for common query: find active, unused, not expired coupons
CouponSchema.index({ business: 1, isActive: 1, isUsed: 1, expiryDate: 1 });
CouponSchema.index({ business: 1, isUsed: 1 });
CouponSchema.index({ invoice: 1 });
CouponSchema.index({ couponCode: 1 });
CouponSchema.index({ expiryDate: 1 });

const CouponModel =
  mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);

export default CouponModel;

