import Message from "../models/Message.js";
import User from "../models/User.js";
import imagekit from "../configs/imagekit.js";


// ================= SEND MESSAGE =================

export const sendMessage = async (req, res) => {
  try {

    const { userId } = await req.auth();

    // Get receiverId from either params or body
    const receiverId = req.params.receiverId || req.body.receiverId;

    const { text } = req.body;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is required",
      });
    }

    // ✅ Check receiver exists
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    let imageUrl = "";

    // ✅ Upload image if exists
    if (req.file) {

      const response = await imagekit.upload({
        file: req.file.buffer,
        fileName: req.file.originalname,
        folder: "/pingup/messages",
      });

      imageUrl = response.url;
    }

    // ❌ Prevent empty message
    if (!text && !imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    // ✅ Create message
    const message = await Message.create({
      sender: userId,
      receiver: receiverId,
      text: text || "",
      image: imageUrl,

      message_type: imageUrl
        ? "image"
        : "text",
    });

    // ✅ Populate sender
    await message.populate(
      "sender",
      "full_name username profile_picture"
    );

    res.status(201).json({
      success: true,
      message: "Message sent",
      data: message,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// ================= GET CHAT MESSAGES =================

export const getMessages = async (req, res) => {
  try {

    const { userId } = await req.auth();

    const { receiverId } = req.params;

    // ✅ Fetch chat between two users
    const messages = await Message.find({
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
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'full_name username profile_picture')
      .populate('receiver', 'full_name username profile_picture');

    res.status(200).json({
      success: true,
      data: messages,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// ================= MARK MESSAGES AS SEEN =================

export const markMessagesSeen = async (
  req,
  res
) => {
  try {

    const { userId } = await req.auth();

    const { senderId } = req.params;

    // ✅ Mark unseen messages
    await Message.updateMany(

      {
        sender: senderId,
        receiver: userId,
        seen: false,
      },

      {
        seen: true,
      }

    );

    res.status(200).json({
      success: true,
      message: "Messages marked as seen",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// ================= GET RECENT CHATS =================

export const getRecentChats = async (req, res) => {
  try {

    const { userId } = await req.auth();

    // ✅ Fetch all messages involving user
    const messages = await Message.find({
      $or: [
        { sender: userId },
        { receiver: userId },
      ],
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'full_name username profile_picture')
      .populate('receiver', 'full_name username profile_picture');

    // ✅ Unique users map
    const chatUsers = new Map();

    messages.forEach((msg) => {
      const senderId = msg.sender?._id?.toString() || msg.sender?.toString()
      const receiverId = msg.receiver?._id?.toString() || msg.receiver?.toString()
      const isSender = senderId === userId
      const otherUser = isSender ? msg.receiver : msg.sender
      const chatKey = otherUser?._id?.toString() || otherUser?.toString()

      if (!chatUsers.has(chatKey)) {
        chatUsers.set(chatKey, {
          ...msg.toObject(),
          from_user_id: otherUser,
          sender: msg.sender,
          receiver: msg.receiver,
        })
      }
    });

    const recentChats = Array.from(
      chatUsers.values()
    );

    res.status(200).json({
      success: true,
      data: recentChats,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};