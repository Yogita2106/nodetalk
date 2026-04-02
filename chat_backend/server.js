require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");
const chatSocket = require("./sockets/chatSocket");

connectDB();

const app = express();
const server = http.createServer(app);

// 1. Update Socket.io CORS for Live
const io = new Server(server, {
  cors: { 
    origin: "*", // Allows any frontend to connect; better for debugging live issues
    methods: ["GET", "POST"]
  },
});

chatSocket(io);

// 2. Move CORS middleware to the top
app.use(cors()); 
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// 3. CRITICAL: Use process.env.PORT for Render
const PORT = process.env.PORT || 5000; 
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));