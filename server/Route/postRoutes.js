import express from "express";
import { clerkMiddleware } from "@clerk/express";

import upload from "../configs/multer.js";

import {
  createPost,
  getFeedPosts,
  getUserPosts,
  likePost,
  addComment,
  deletePost,
  searchPosts,
} from "../controllers/postController.js";

const router = express.Router();


// ================= CREATE POST =================

router.post(
  "/create",
  upload.single("image"),
  createPost
);


// ================= GET FEED POSTS =================

router.get(
  "/feed",
  getFeedPosts
);


// ================= GET USER POSTS =================

router.get(
  "/user/:profileId",
  getUserPosts
);


// ================= LIKE / UNLIKE POST =================

router.put(
  "/like/:postId",
  likePost
);


// ================= ADD COMMENT =================

router.post(
  "/comment/:postId",
  addComment
);


// ================= DELETE POST =================

router.delete(
  "/delete/:postId",
  deletePost
);

// ================= SEARCH POSTS =================

router.get(
  "/search",
  searchPosts
);

export default router;