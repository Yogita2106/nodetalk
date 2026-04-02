const express = require("express");
// Controller se naya function import kiya
const { register, login, getUsers, searchUsers } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/users", getUsers);

// Naya search route add kiya
router.get("/search", searchUsers); 

module.exports = router;