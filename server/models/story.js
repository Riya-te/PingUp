import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    // ✅ Story owner
    user: {
      type: String,
      ref: "User",
      required: true,
    },

    // ✅ Story image/video URL
    media: {
      type: String,
      required: true,
    },

    // ✅ Media type
    media_type: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },

    // ✅ Optional caption
    caption: {
      type: String,
      default: "",
      maxlength: 150,
      trim: true,
    },

    // ✅ Users who viewed story
    viewers: [
      {
        type: String,
        ref: "User",
      },
    ],

    // ✅ Story expires after 24 hours
    expires_at: {
      type: Date,
      default: () =>
        new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
  }
);


// ✅ Automatically delete expired stories
storySchema.index(
  { expires_at: 1 },
  { expireAfterSeconds: 0 }
);


// ✅ Prevent overwrite error
const Story =
  mongoose.models.Story ||
  mongoose.model("Story", storySchema);

export default Story;