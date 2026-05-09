import express from "express";
import { clerkMiddleware } from "@clerk/express";

import upload from "../configs/multer.js";

import {
  createStory,
  getStoriesFeed,
  viewStory,
  deleteStory,
} from "../controllers/storyController.js";

const router = express.Router();


// ================= GET STORIES FEED =================

router.get(
  "/",
  getStoriesFeed
);

router.get(
  "/feed",
  getStoriesFeed
);


// ================= CREATE STORY =================

router.post(
  "/create",
  upload.single("media"),
  createStory
);


// ================= VIEW STORY =================

router.put(
  "/view/:storyId",
  viewStory
);


// ================= DELETE STORY =================

router.delete(
  "/delete/:storyId",
  deleteStory
);

export default router;