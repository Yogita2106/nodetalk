const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  username: { type: String, unique: true }, // Naya field add kiya
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);