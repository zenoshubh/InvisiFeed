import mongoose, { Schema } from "mongoose";

const AccountSchema = new Schema(
  {
    // Authentication Fields
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [/.+\@.+\..+/, "Please use a valid email address"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    verifyCode: {
      type: String,
      required: [true, "Verify code is required"],
    },
    verifyCodeExpiry: {
      type: Date,
      required: [true, "Verify code expiry is required"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isGoogleAuth: {
      type: Boolean,
      default: false,
    },
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpiry: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Performance Indexes
// Note: email and username indexes are automatically created by unique: true
AccountSchema.index({ isVerified: 1 });
AccountSchema.index({ createdAt: -1 });

const AccountModel =
  mongoose.models.Account || mongoose.model("Account", AccountSchema);

export default AccountModel;

