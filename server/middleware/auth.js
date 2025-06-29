// middleware/auth.js
const jwt = require("jsonwebtoken");
const JWT_SECRET = "supersecret"; // Move to .env in production

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1]; // Bearer <token>

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id: ... }
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
};
