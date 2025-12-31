import mongoose, { Schema } from "mongoose";

const DeletedAccountSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    deletionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Performance Indexes
// Note: email index is automatically created by unique: true
DeletedAccountSchema.index({ deletionDate: -1 });

const DeletedAccountModel =
  mongoose.models.DeletedAccount ||
  mongoose.model("DeletedAccount", DeletedAccountSchema);

export default DeletedAccountModel;

