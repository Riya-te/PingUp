import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    // ✅ Sender
    sender: {
      type: String,
      ref: "User",
      required: true,
    },

    // ✅ Receiver
    receiver: {
      type: String,
      ref: "User",
      required: true,
    },

    // ✅ Message text
    text: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    // ✅ Optional image/file
    image: {
      type: String,
      default: "",
    },

    // ✅ Read status
    seen: {
      type: Boolean,
      default: false,
    },

    // ✅ Message type
    message_type: {
      type: String,
      enum: ["text", "image"],
      default: "text",
    },
  },
  {
    timestamps: true,
  }
);


// ✅ Prevent overwrite error
const Message =
  mongoose.models.Message ||
  mongoose.model("Message", messageSchema);

export default Message;