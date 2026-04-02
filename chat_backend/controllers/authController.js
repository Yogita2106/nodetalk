const User = require("../models/User");
const OTP = require("../models/OTP");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

// 1. Send OTP
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("OTP Request for:", email);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.findOneAndUpdate(
      { email },
      { otp, createdAt: Date.now() },
      { upsert: true, new: true }
    );

    await sendEmail(email, otp);
    res.status(200).json({ message: "OTP sent successfully to your email" });
  } catch (error) {
    console.error("SendOTP Error:", error);
    res.status(500).json({ message: "Failed to send OTP", error: error.message });
  }
};

// 2. Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.findOneAndUpdate(
      { email },
      { otp, createdAt: Date.now() },
      { upsert: true, new: true }
    );

    await sendEmail(email, otp);
    res.status(200).json({ message: "A new OTP has been sent to your email!" });
  } catch (error) {
    console.error("ResendOTP Error:", error);
    res.status(500).json({ message: "Failed to resend OTP", error: error.message });
  }
};

// 3. Verify OTP (Only for checking)
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) return res.status(400).json({ message: "Invalid or expired OTP" });

    res.status(200).json({ message: "OTP verified successfully. Proceed to registration." });
  } catch (error) {
    console.error("VerifyOTP Error:", error);
    res.status(500).json({ message: "Verification failed", error: error.message });
  }
};

// 4. Register User
exports.register = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    const otpDetails = await OTP.findOne({ email, otp });
    if (!otpDetails) return res.status(400).json({ message: "Invalid or expired OTP" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = email.split("@")[0] + "_" + Math.floor(Math.random() * 10000);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      username,
    });

    await OTP.deleteOne({ email });
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

// 5. Login User (FIXED)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for:", email);

    // User dhundo
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found");
      return res.status(401).json({ message: "Invalid credentials (Email not found)" });
    }

    // Password check karo
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch");
      return res.status(401).json({ message: "Invalid credentials (Wrong password)" });
    }

    // Token generate karo
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    console.log("Login successful");
    // Response bhejo (Iske bina Postman hang ho jata hai)
    res.status(200).json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        username: user.username,
        email: user.email 
      } 
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// 6. Get All Users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

// 7. Search Users
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(200).json([]);

    const users = await User.find({
      $or: [
        { email: { $regex: q, $options: "i" } },
        { username: { $regex: q, $options: "i" } }
      ]
    }).select("-password");

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Search failed", error: error.message });
  }
};