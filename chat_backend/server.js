require("dotenv").config(); // Sabse pehle env load karo
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const connectDB = require("./config/db"); // DB connection logic [cite: 1]
const authRoutes = require("./routes/authRoutes"); // OTP routes isme honge
const messageRoutes = require("./routes/messageRoutes");
const chatSocket = require("./sockets/chatSocket");

connectDB(); // MongoDB connect karo [cite: 1]

const app = express();
const server = http.createServer(app);

// Socket.io Setup
const io = new Server(server, {
  cors: { 
    origin: "*", 
    methods: ["GET", "POST"]
  },
});

chatSocket(io); // Socket events initialize

// Middlewares
app.use(cors({
  origin: ["http://localhost:5173", "https://your-frontend-link.vercel.app"], // Apna frontend link bhi add kar dena
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json()); // Body parser for JSON

// Routes
app.use("/api/auth", authRoutes); // Yahan se /send-otp aur /register chalenge
app.use("/api/messages", messageRoutes);


// Server Listen
const PORT = process.env.PORT || 5000; 
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));




