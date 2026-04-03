const express = require("express");
const { 
  register, 
  login, 
  getUsers, 
  searchUsers, 
  sendOTP, 
  verifyOTP, 
  resendOTP 
} = require("../controllers/authController");

const router = express.Router();

// 1. OTP Routes
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP); 
router.post("/resend-otp", resendOTP);

// 2. Auth Routes
router.post("/register", register);
router.post("/login", login);

// 3. User Routes
router.get("/users", getUsers);
router.get("/search", searchUsers);

module.exports = router;