import mongoose, { Schema } from "mongoose";

const DeletedAccountSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    deletionDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Performance Indexes
DeletedAccountSchema.index({ email: 1 });
DeletedAccountSchema.index({ deletionDate: -1 });

const DeletedAccountModel =
  mongoose.models.DeletedAccount ||
  mongoose.model("DeletedAccount", DeletedAccountSchema);

export default DeletedAccountModel;

