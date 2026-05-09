import Story from "../models/Story.js";
import User from "../models/User.js";
import imagekit from "../configs/imagekit.js";


// ================= CREATE STORY =================

export const createStory = async (req, res) => {
  try {

    const { userId } = await req.auth();

    const { caption } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Check media uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Story media is required",
      });
    }

    // ✅ Upload to ImageKit
    const response = await imagekit.upload({
      file: req.file.buffer,
      fileName: req.file.originalname,
      folder: "/pingup/stories",
    });

    // ✅ Detect media type
    const mediaType =
      req.file.mimetype.startsWith("video")
        ? "video"
        : "image";

    // ✅ Create story
    const story = await Story.create({
      user: userId,
      media: response.url,
      media_type: mediaType,
      caption,
    });

    res.status(201).json({
      success: true,
      message: "Story created successfully",
      data: story,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// ================= GET STORIES FEED =================

export const getStoriesFeed = async (req, res) => {
  try {

    const stories = await Story.find()
      .populate(
        "user",
        "full_name username profile_picture"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: stories,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// ================= VIEW STORY =================

export const viewStory = async (req, res) => {
  try {

    const { userId } = await req.auth();
    const { storyId } = req.params;

    const story = await Story.findById(storyId);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    // ✅ Add viewer if not already viewed
    if (!story.viewers.includes(userId)) {
      story.viewers.push(userId);

      await story.save();
    }

    res.status(200).json({
      success: true,
      message: "Story viewed",
      data: story,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// ================= DELETE STORY =================

export const deleteStory = async (req, res) => {
  try {

    const { userId } = await req.auth();
    const { storyId } = req.params;

    const story = await Story.findById(storyId);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    // ❌ Prevent deleting others' stories
    if (story.user !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // ✅ Delete story
    await Story.findByIdAndDelete(storyId);

    res.status(200).json({
      success: true,
      message: "Story deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};