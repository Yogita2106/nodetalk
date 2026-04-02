const express = require("express");
const { getMessages, getChattedUsers } = require("../controllers/messageController");
const router = express.Router();

router.get("/", getMessages); // Chat history ke liye
router.get("/conversations", getChattedUsers); // Sidebar list ke liye

module.exports = router;