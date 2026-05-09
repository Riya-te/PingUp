import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

import connectDB from "./configs/db.js";

// ✅ Clerk
import { clerkMiddleware } from "@clerk/express";

// ✅ Inngest
import { inngest, functions } from "./inngest/index.js";
import { serve } from "inngest/express";

// ✅ Routes
import userRoutes from "./Route/userRoutes.js";
import postRoutes from "./Route/postRoutes.js";
import storyRoutes from "./Route/storyRoutes.js";
import messageRoutes from "./Route/messageRoutes.js";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});


// ================= CONNECT DATABASE =================

connectDB();


// ================= MIDDLEWARES =================

app.use(express.json());

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(clerkMiddleware());


// ================= TEST ROUTE =================

app.get("/", (req, res) => {
  res.send("Server is running ✅");
});


// ================= INNGEST ROUTE =================

app.use(

  "/api/inngest",

  serve({
    client: inngest,
    functions,
  })

);


// ================= USER ROUTES =================

app.use(
  "/api/user",
  userRoutes
);


// ================= POST ROUTES =================

app.use(
  "/api/post",
  postRoutes
);


// ================= STORY ROUTES =================

app.use(
  "/api/story",
  storyRoutes
);


// ================= MESSAGE ROUTES =================

app.use(
  "/api/messages",
  messageRoutes
);


// ================= START SERVER =================

const PORT = process.env.PORT || 5000;

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user room for private messages
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  // Handle private messages
  socket.on('sendMessage', async (data) => {
    const { senderId, receiverId, text } = data;

    try {
      // Save message to database (we'll implement this)
      const message = {
        senderId,
        receiverId,
        text,
        timestamp: new Date()
      };

      // Emit to receiver
      io.to(receiverId).emit('receiveMessage', message);

      // Emit back to sender for confirmation
      socket.emit('messageSent', message);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('messageError', { error: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { senderId, receiverId, isTyping } = data;
    socket.to(receiverId).emit('userTyping', { senderId, isTyping });
  });

  // Handle post likes
  socket.on('likePost', async (data) => {
    const { postId, userId } = data;
    try {
      // We'll implement this in the post controller
      io.emit('postLiked', { postId, userId });
    } catch (error) {
      console.error('Error liking post:', error);
    }
  });

  // Handle comments
  socket.on('addComment', async (data) => {
    const { postId, userId, text } = data;
    try {
      // We'll implement this in the post controller
      io.emit('commentAdded', { postId, userId, text });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Socket.IO server ready`);
});