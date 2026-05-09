import User from "../models/User.js";
import imagekit from "../configs/imagekit.js";
import Connection from "../models/Connection.js";
import { inngest } from "../inngest/index.js";

// ================= USER CONTROLLERS =================


// ✅ Get Logged In User Data
export const getUserData = async (req, res) => {
  try {

    const { userId } = await req.auth();

    let user = await User.findById(userId)
      .populate("posts");

    // If user doesn't exist, create them
    if (!user) {
      // Get user data from Clerk
      const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (clerkUser.ok) {
        const userData = await clerkUser.json();
        const email = userData.email_addresses?.[0]?.email_address;
        let username = email ? email.split("@")[0] : `user_${userId.slice(-8)}`;

        // Check if username exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          username += Math.floor(Math.random() * 10000);
        }

        user = await User.create({
          _id: userId,
          email: email || '',
          full_name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
          profile_picture: userData.image_url || '',
          username,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "User not found in authentication service",
        });
      }
    }

    res.status(200).json({
      success: true,
      data: user,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// ✅ Get User Profile
export const getUserProfile = async (req, res) => {
  try {

    const { profileId } = req.params;

    const user = await User.findById(profileId)
      .populate("posts");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// ✅ Update User Data + Image Upload
export const updateUserData = async (req, res) => {
  try {

    const { userId } = await req.auth();

    const {
      full_name,
      bio,
      location,
    } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updateData = {};

    // ✅ Safe updates
    if (full_name !== undefined)
      updateData.full_name = full_name;

    if (bio !== undefined)
      updateData.bio = bio;

    if (location !== undefined)
      updateData.location = location;

    // ✅ Upload profile picture
    if (req.files?.profile_picture?.[0]) {

      const file = req.files.profile_picture[0];

      const response = await imagekit.upload({
        file: file.buffer,
        fileName: file.originalname,
        folder: "/pingup/profile_pictures",
      });

      updateData.profile_picture = response.url;
    }

    // ✅ Upload cover photo
    if (req.files?.cover_photo?.[0]) {

      const file = req.files.cover_photo[0];

      const response = await imagekit.upload({
        file: file.buffer,
        fileName: file.originalname,
        folder: "/pingup/cover_photos",
      });

      updateData.cover_photo = response.url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// ✅ Follow / Unfollow User
export const followUser = async (req, res) => {
  try {

    const { userId } = await req.auth();
    const { targetUserId } = req.params;

    if (userId === targetUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    const currentUser = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isFollowing =
      currentUser.following.includes(targetUserId);

    if (isFollowing) {

      // ❌ Unfollow
      currentUser.following =
        currentUser.following.filter(
          (id) => id !== targetUserId
        );

      targetUser.followers =
        targetUser.followers.filter(
          (id) => id !== userId
        );

      await currentUser.save();
      await targetUser.save();

      return res.status(200).json({
        success: true,
        message: "User unfollowed",
      });

    } else {

      // ✅ Follow
      if (
        !currentUser.following.includes(targetUserId)
      ) {
        currentUser.following.push(targetUserId);
      }

      if (
        !targetUser.followers.includes(userId)
      ) {
        targetUser.followers.push(userId);
      }

      await currentUser.save();
      await targetUser.save();

      return res.status(200).json({
        success: true,
        message: "User followed",
      });
    }

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};



// ================= CONNECTION CONTROLLERS =================


// ✅ Send Connection Request
export const sendConnectionRequest = async (req, res) => {
  try {

    const { userId } = await req.auth();
    const { receiverId } = req.params;

    if (userId === receiverId) {
      return res.status(400).json({
        success: false,
        message: "You cannot connect with yourself",
      });
    }

    const sender = await User.findById(userId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingConnection =
      await Connection.findOne({
        $or: [
          {
            sender: userId,
            receiver: receiverId,
          },
          {
            sender: receiverId,
            receiver: userId,
          },
        ],
      });

    if (existingConnection) {
      return res.status(400).json({
        success: false,
        message:
          "Connection request already exists",
      });
    }

    const connection = await Connection.create({
      sender: userId,
      receiver: receiverId,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Connection request sent",
      data: connection,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// ✅ Accept Connection Request
export const acceptConnectionRequest = async (
  req,
  res
) => {
  try {

    const { userId } = await req.auth();
    const { connectionId } = req.params;

    const connection =
      await Connection.findById(connectionId);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Connection not found",
      });
    }

    if (connection.receiver !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the request receiver can accept the connection",
      });
    }

    if (connection.status === "accepted") {
      return res.status(200).json({
        success: true,
        message: "Connection already accepted",
        data: connection,
      });
    }

    connection.status = "accepted";
    await connection.save();

    const sender = await User.findById(connection.sender);
    const receiver = await User.findById(connection.receiver);

    if (sender && receiver) {
      if (!sender.following.includes(receiver._id)) {
        sender.following.push(receiver._id);
      }
      if (!receiver.followers.includes(sender._id)) {
        receiver.followers.push(sender._id);
      }
      await sender.save();
      await receiver.save();
    }

    res.status(200).json({
      success: true,
      message: "Connection accepted",
      data: connection,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// ✅ Get Pending Connection Requests
export const getConnectionRequests = async (
  req,
  res
) => {
  try {

    const { userId } = await req.auth();

    const requests = await Connection.find({
      receiver: userId,
      status: "pending",
    })
      .populate("sender");

    res.status(200).json({
      success: true,
      data: requests,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};



// ✅ Get Accepted Connections
export const getAcceptedConnections = async (
  req,
  res
) => {
  try {
    const { userId } = await req.auth();

    const accepted = await Connection.find({
      status: "accepted",
      $or: [
        { sender: userId },
        { receiver: userId },
      ],
    })
      .populate("sender", "full_name username profile_picture bio")
      .populate("receiver", "full_name username profile_picture bio");

    const connections = accepted.map((connection) => {
      const otherUser =
        connection.sender._id.toString() === userId
          ? connection.receiver
          : connection.sender;

      return {
        id: otherUser._id,
        full_name: otherUser.full_name,
        username: otherUser.username,
        profile_picture: otherUser.profile_picture,
        bio: otherUser.bio,
        connectionId: connection._id,
      };
    });

    res.status(200).json({
      success: true,
      data: connections,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= SEARCH USERS =================

export const searchUsers = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query required",
      });
    }

    const currentUser = await User.findById(userId).select("following followers");

    const users = await User.find({
      _id: { $ne: userId },
      $or: [
        { full_name: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } }
      ]
    })
      .select("full_name username profile_picture bio followers following")
      .limit(20);

    const ids = users.map((user) => user._id.toString());

    const connections = await Connection.find({
      $or: [
        { sender: userId, receiver: { $in: ids } },
        { sender: { $in: ids }, receiver: userId },
      ],
    });

    const mappedUsers = users.map((user) => {
      const isFollowing = currentUser.following.includes(user._id.toString());
      const connection = connections.find((connection) => {
        const senderId = connection.sender.toString();
        const receiverId = connection.receiver.toString();
        return (
          (senderId === userId && receiverId === user._id.toString()) ||
          (senderId === user._id.toString() && receiverId === userId)
        );
      });

      let connectionStatus = null;
      if (connection) {
        if (connection.status === 'accepted') {
          connectionStatus = 'accepted';
        } else if (connection.status === 'pending') {
          connectionStatus = connection.sender.toString() === userId ? 'pending' : 'incoming';
        }
      }

      return {
        _id: user._id,
        full_name: user.full_name,
        username: user.username,
        profile_picture: user.profile_picture,
        bio: user.bio,
        isFollowing,
        connectionStatus,
        connectionId: connection?._id,
      };
    });

    res.status(200).json({
      success: true,
      data: mappedUsers,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};