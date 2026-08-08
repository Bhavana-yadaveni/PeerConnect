const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// GET /api/users  -> list all users (for a "find peers" page), excludes self
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.userId } }).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong fetching users." });
  }
});

// GET /api/users/:id -> single user's public profile
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong." });
  }
});

// PUT /api/users/me -> update the logged-in user's own profile
router.put("/me", authMiddleware, async (req, res) => {
  try {
    const { name, course, year, bio, skills, interests } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.userId,
      {
        ...(name !== undefined && { name }),
        ...(course !== undefined && { course }),
        ...(year !== undefined && { year }),
        ...(bio !== undefined && { bio }),
        ...(skills !== undefined && { skills }),
        ...(interests !== undefined && { interests }),
      },
      { new: true, runValidators: true }
    ).select("-password");

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong updating your profile." });
  }
});

module.exports = router;
