require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const messageRoutes = require("./routes/messages");
const Message = require("./models/Message");

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const io = new Server(server, {
  cors: { origin: CLIENT_URL, methods: ["GET", "POST"] },
});

// ---------- Middleware ----------
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

// ---------- REST routes ----------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/messages", messageRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "PeerConnect API is running." });
});

// ---------- Socket.io real-time chat ----------
// Map of userId -> socketId, so we know where to deliver a message
const onlineUsers = new Map();

// Authenticate every socket connection using the same JWT used for REST calls
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Authentication required."));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error("Invalid token."));
  }
});

io.on("connection", (socket) => {
  onlineUsers.set(socket.userId, socket.id);
  console.log(`User connected: ${socket.userId}`);

  // Let the frontend know who's online (optional feature, used for a green dot)
  io.emit("online-users", Array.from(onlineUsers.keys()));

  // Client sends: { receiverId, text }
  socket.on("send-message", async ({ receiverId, text }) => {
    if (!text || !receiverId) return;

    try {
      const message = await Message.create({
        sender: socket.userId,
        receiver: receiverId,
        text,
      });

      // Deliver to receiver if they're online right now
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive-message", message);
      }

      // Echo back to sender so their own UI updates immediately
      socket.emit("receive-message", message);
    } catch (err) {
      console.error("Error saving message:", err.message);
    }
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(socket.userId);
    io.emit("online-users", Array.from(onlineUsers.keys()));
    console.log(`User disconnected: ${socket.userId}`);
  });
});

// ---------- Start server ----------
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
