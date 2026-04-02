const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 1. Register User (Ab ye automatically username banayega)
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Auto-generate Unique Username (Email ke aage ka hissa + random number)
    const username = email.split("@")[0] + "_" + Math.floor(Math.random() * 10000);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      username, // DB mein username save kar rahe hain
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

// 2. Login User (Ye same rahega)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};

// 3. GET ALL USERS (Optional: Agar sabko list dikhani ho)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

// 4. NEW: Search Users API
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query; // URL se search query nikalna
    if (!q) return res.status(200).json([]); // Agar search khali hai toh kuch mat bhejo

    // Regex se email ya username dono mein case-insensitive search
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