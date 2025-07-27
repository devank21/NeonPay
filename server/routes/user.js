// server/routes/user.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authenticate = require("../middleware/auth");

// Get user profile
router.get("/profile", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // Exclude password from result
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// Update user profile
router.put("/profile", authenticate, async (req, res) => {
  const { username } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { username },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

module.exports = router;
