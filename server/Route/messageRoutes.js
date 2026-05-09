import express from "express";

import { clerkMiddleware } from "@clerk/express";

import upload from "../configs/multer.js";

import {
  sendMessage,
  getMessages,
  markMessagesSeen,
  getRecentChats,
} from "../controllers/messageController.js";

const router = express.Router();


// ================= SEND MESSAGE =================

router.post(
  "/send",
  upload.single("image"),
  sendMessage
);

router.post(
  "/send/:receiverId",
  upload.single("image"),
  sendMessage
);


// ================= GET CHAT MESSAGES =================

router.get(
  "/:receiverId",
  getMessages
);


// ================= MARK MESSAGES AS SEEN =================

router.put(
  "/seen/:senderId",
  markMessagesSeen
);


// ================= GET RECENT CHATS =================

router.get(
  "/recent",
  getRecentChats
);


export default router;