import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema(
  {
    // ✅ User who sends request
    sender: {
      type: String,
      ref: "User",
      required: true,
    },

    // ✅ User who receives request
    receiver: {
      type: String,
      ref: "User",
      required: true,
    },

    // ✅ Connection status
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Prevent overwrite error
const Connection =
  mongoose.models.Connection ||
  mongoose.model("Connection", connectionSchema);

export default Connection;