const Message = require("../models/Message");
const User = require("../models/User");

// 1. GET MESSAGES (Purana Logic - Chat History ke liye)
exports.getMessages = async (req, res) => {
  try {
    const { sender, receiver } = req.query; 

    if (!sender || !receiver) {
      return res.status(400).json({ message: "Sender and Receiver IDs are required" });
    }

    const messages = await Message.find({
      $or: [
        { sender: sender, receiver: receiver },
        { sender: receiver, receiver: sender },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages" });
  }
};

// 2. GET CONVERSATIONS (Naya Logic - Sirf un users ke liye jinse baat hui hai)
exports.getChattedUsers = async (req, res) => {
  try {
    const { userId } = req.query; // Frontend se logged-in user ki ID

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Messages collection mein check karo kahan ye user sender ya receiver tha
    const sentMessages = await Message.distinct("receiver", { sender: userId });
    const receivedMessages = await Message.distinct("sender", { receiver: userId });

    // Dono list ko merge karke unique IDs nikalo
    const allChattedIds = [...new Set([...sentMessages, ...receivedMessages])];

    // Un IDs ke details User model se nikalo (password hide karke)
    const users = await User.find({ _id: { $in: allChattedIds } }).select("-password");

    res.status(200).json(users);
  } catch (error) {
    console.error("Conversation Fetch Error:", error);
    res.status(500).json({ message: "Error fetching conversations" });
  }
};