const express = require("express");
const { userAuth } = require("../middlewares/auth");
const Block = require("../models/block");
const ConnectionRequest = require("../models/connectionRequest");

const blockRouter = express.Router();

// Block a user
blockRouter.post("/user/block/:userId", userAuth, async (req, res) => {
  try {
    const blockedBy = req.user._id;
    const blockedUser = req.params.userId;
    const { reason, reportMessage } = req.body;

    if (blockedBy.toString() === blockedUser) {
      return res.status(400).json({ message: "You cannot block yourself." });
    }

    // Check if already blocked
    const existing = await Block.findOne({ blockedBy, blockedUser });
    if (existing) {
      return res.status(400).json({ message: "User is already blocked." });
    }

    const block = new Block({
      blockedBy,
      blockedUser,
      reason: reason || "other",
      reportMessage: reportMessage || "",
    });

    await block.save();

    // Also remove any existing connection requests between them
    await ConnectionRequest.deleteMany({
      $or: [
        { fromUserId: blockedBy, toUserId: blockedUser },
        { fromUserId: blockedUser, toUserId: blockedBy },
      ],
    });

    res.json({ message: "User blocked successfully." });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "User is already blocked." });
    }
    res.status(500).json({ message: err.message });
  }
});

// Unblock a user
blockRouter.post("/user/unblock/:userId", userAuth, async (req, res) => {
  try {
    const blockedBy = req.user._id;
    const blockedUser = req.params.userId;

    const result = await Block.findOneAndDelete({ blockedBy, blockedUser });
    if (!result) {
      return res.status(404).json({ message: "User is not blocked." });
    }

    res.json({ message: "User unblocked successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get blocked users list
blockRouter.get("/user/blocked", userAuth, async (req, res) => {
  try {
    const blocks = await Block.find({ blockedBy: req.user._id })
      .populate("blockedUser", "firstName lastName photoUrl")
      .sort({ createdAt: -1 });

    res.json({ data: blocks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Check if a specific user is blocked
blockRouter.get("/user/blocked/:userId", userAuth, async (req, res) => {
  try {
    const block = await Block.findOne({
      blockedBy: req.user._id,
      blockedUser: req.params.userId,
    });
    res.json({ isBlocked: !!block });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = blockRouter;
