import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    username: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },

    full_name: {
      type: String,
      required: true,
      trim: true,
    },

    bio: {
      type: String,
      default: "Hey there! I am using PingUp 🚀",
      maxlength: 160,
    },

    profile_picture: {
      type: String,
      default: "",
    },

    cover_photo: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

    followers: [
      {
        type: String,
        ref: "User",
      },
    ],

    following: [
      {
        type: String,
        ref: "User",
      },
    ],

    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
  },
  {
    timestamps: true,
    minimize: false,
  }
);

// ✅ Prevent model overwrite error in development
const User =
  mongoose.models.User || mongoose.model("User", userSchema);

export default User;