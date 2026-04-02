const express = require("express");
// Controller se saare functions import kiye
const { 
  register, 
  login, 
  getUsers, 
  searchUsers, 
  sendOTP, 
  verifyOTP, resendOTP
} = require("../controllers/authController");

const router = express.Router();

// 1. Sabse pehle OTP bhejnewala route
router.post("/send-otp", sendOTP);

// 2. Phir sirf OTP verify karnewala naya route
router.post("/verify-otp", verifyOTP); 

// 3. Last mein registration route (OTP ke saath)
router.post("/register", register);

router.post("/login", login);
router.get("/users", getUsers);

// Search route
router.get("/search", searchUsers);

// Resend OTP route
router.post("/resend-otp", resendOTP);

module.exports = router;