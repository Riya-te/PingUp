import Post from "../models/Post.js";
import User from "../models/User.js";
import imagekit from "../configs/imagekit.js";


// ================= CREATE POST =================

export const createPost = async (req, res) => {
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

    let imageUrl = "";

    // ✅ Upload image if exists
    if (req.file) {

      const response = await imagekit.upload({
        file: req.file.buffer,
        fileName: req.file.originalname,
        folder: "/pingup/posts",
      });

      imageUrl = response.url;
    }

    // ✅ Create post
    const post = await Post.create({
      user: userId,
      caption,
      image: imageUrl,
    });

    // ✅ Add post to user
    user.posts.unshift(post._id);

    await user.save();

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: post,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// ================= GET FEED POSTS =================

export const getFeedPosts = async (req, res) => {
  try {

    const posts = await Post.find()
      .populate("user", "full_name username profile_picture")
      .populate(
        "comments.user",
        "full_name username profile_picture"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: posts,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// ================= GET USER POSTS =================

export const getUserPosts = async (req, res) => {
  try {

    const { profileId } = req.params;

    const posts = await Post.find({
      user: profileId,
    })
      .populate("user", "full_name username profile_picture")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: posts,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// ================= LIKE / UNLIKE POST =================

export const likePost = async (req, res) => {
  try {

    const { userId } = await req.auth();
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const isLiked =
      post.likes.includes(userId);

    if (isLiked) {

      // ❌ Unlike
      post.likes = post.likes.filter(
        (id) => id !== userId
      );

      await post.save();

      return res.status(200).json({
        success: true,
        message: "Post unliked",
      });

    } else {

      // ✅ Like
      post.likes.push(userId);

      await post.save();

      return res.status(200).json({
        success: true,
        message: "Post liked",
      });
    }

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// ================= ADD COMMENT =================

export const addComment = async (req, res) => {
  try {

    const { userId } = await req.auth();
    const { postId } = req.params;

    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Comment text required",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // ✅ Add comment
    post.comments.push({
      user: userId,
      text,
    });

    await post.save();

    // ✅ Populate latest comment user
    await post.populate(
      "comments.user",
      "full_name username profile_picture"
    );

    res.status(200).json({
      success: true,
      message: "Comment added",
      data: post,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// ================= SEARCH POSTS =================

export const searchPosts = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query required",
      });
    }

    const posts = await Post.find({
      caption: { $regex: query, $options: 'i' }
    })
      .populate("user", "full_name username profile_picture")
      .populate("comments.user", "full_name username profile_picture")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: posts,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= DELETE POST =================

export const deletePost = async (req, res) => {
  try {

    const { userId } = await req.auth();
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // ❌ Prevent deleting others' posts
    if (post.user !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // ✅ Remove post from user
    await User.findByIdAndUpdate(
      userId,
      {
        $pull: {
          posts: postId,
        },
      }
    );

    // ✅ Delete post
    await Post.findByIdAndDelete(postId);

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};