import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const postSchema = new mongoose.Schema(
  {
    // ✅ Post creator
    user: {
      type: String,
      ref: "User",
      required: true,
    },

    // ✅ Post content
    caption: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    // ✅ Image URL
    image: {
      type: String,
      default: "",
    },

    // ✅ Likes
    likes: [
      {
        type: String,
        ref: "User",
      },
    ],

    // ✅ Comments
    comments: [commentSchema],
  },
  {
    timestamps: true,
    minimize: false,
  }
);

// ✅ Prevent overwrite error
const Post =
  mongoose.models.Post ||
  mongoose.model("Post", postSchema);

export default Post;