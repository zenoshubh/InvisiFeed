import mongoose, { Schema } from "mongoose";

const DeletedAccountSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  deletionDate: {
    type: Date,
    required: true,
  },
});

const DeletedAccountModel =
  mongoose.models.DeletedAccount ||
  mongoose.model("DeletedAccount", DeletedAccountSchema);

export default DeletedAccountModel;
