import mongoose, { Schema } from "mongoose";

const BusinessSchema = new Schema(
  {
    account: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      unique: true,
      index: true,
    },
    businessName: {
      type: String,
      required: [true, "Business Name is required"],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: false,
      default: "",
      trim: true,
    },
    address: {
      localAddress: {
        type: String,
        required: false,
        trim: true,
        default: "",
      },
      city: {
        type: String,
        required: false,
        trim: true,
        default: "",
      },
      state: {
        type: String,
        required: false,
        trim: true,
        default: "",
      },
      country: {
        type: String,
        required: false,
        trim: true,
        default: "",
      },
      pincode: {
        type: String,
        required: false,
        default: "",
      },
    },
    isProfileCompleted: {
      type: String,
      enum: ["pending", "skipped", "completed"],
      default: "pending",
      index: true,
    },
    gstinDetails: {
      gstinNumber: {
        type: String,
        required: false,
        default: "",
      },
      gstinHolderName: {
        type: String,
        required: false,
        default: "",
      },
      gstinVerificationStatus: {
        type: Boolean,
        default: false,
      },
    },
    proTrialUsed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Performance Indexes
BusinessSchema.index({ account: 1 }, { unique: true });
BusinessSchema.index({ isProfileCompleted: 1 });
BusinessSchema.index({ createdAt: -1 });

const BusinessModel =
  mongoose.models.Business || mongoose.model("Business", BusinessSchema);

export default BusinessModel;

