const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  let token = req.headers.authorization;

  if (!token) return res.status(401).json({ message: "No token provided" });

  // Agar token 'Bearer ' se shuru hota hai, toh usko split karke actual token nikalo
  if (token.startsWith("Bearer ")) {
    token = token.split(" ")[1];
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};