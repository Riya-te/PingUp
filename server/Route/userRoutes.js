import express from "express";
import upload from "../configs/multer.js";

// ✅ User Controllers
import {
  getUserData,
  getUserProfile,
  updateUserData,
  followUser,
  sendConnectionRequest,
  acceptConnectionRequest,
  getConnectionRequests,
  getAcceptedConnections,
  searchUsers,
} from "../controllers/userController.js";

// ✅ Clerk Middleware
import { clerkMiddleware } from "@clerk/express";

const router = express.Router();


// ================= USER ROUTES =================

// ✅ Get logged-in user
router.get(
  "/me",
  getUserData
);

// ✅ Get profile
router.get(
  "/profile/:profileId",
  getUserProfile
);

// ✅ Update profile
router.put(
  "/update",

  upload.fields([
    {
      name: "profile_picture",
      maxCount: 1,
    },
    {
      name: "cover_photo",
      maxCount: 1,
    },
  ]),

  updateUserData
);

// ✅ Follow / Unfollow
router.put(
  "/follow/:targetUserId",
  followUser
);


// ================= CONNECTION ROUTES =================

// ✅ Send connection request
router.post(
  "/connect/:receiverId",
  sendConnectionRequest
);

// ✅ Accept connection request
router.put(
  "/accept/:connectionId",
  acceptConnectionRequest
);

// ✅ Get all pending requests
router.get(
  "/connections",
  getConnectionRequests
);

// ✅ Get accepted connections
router.get(
  "/connections/accepted",
  getAcceptedConnections
);

// ✅ Search users
router.get(
  "/search",
  searchUsers
);

export default router;