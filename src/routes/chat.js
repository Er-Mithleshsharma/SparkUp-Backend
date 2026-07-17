const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { Chat } = require("../models/chat");

const chatRouter = express.Router();

// Get chat messages with pagination (latest messages first)
chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;

  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName",
    });

    if (!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
        messages: [],
      });
      await chat.save();
      return res.json({ ...chat.toObject(), totalMessages: 0, hasMore: false });
    }

    // Mark messages from other user as seen when fetching
    let updated = false;
    chat.messages.forEach((msg) => {
      if (msg.senderId && msg.senderId._id.toString() === targetUserId && !msg.seen) {
        msg.seen = true;
        updated = true;
      }
    });
    if (updated) {
      await chat.save();
    }

    const totalMessages = chat.messages.length;
    const startIndex = Math.max(0, totalMessages - page * limit);
    const endIndex = totalMessages - (page - 1) * limit;
    const paginatedMessages = chat.messages.slice(startIndex, endIndex);

    res.json({
      ...chat.toObject(),
      messages: paginatedMessages,
      totalMessages,
      hasMore: startIndex > 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get unread counts for all conversations
chatRouter.get("/chat/unread/counts", userAuth, async (req, res) => {
  const userId = req.user._id;

  try {
    const chats = await Chat.find({
      participants: userId,
    });

    const unreadCounts = {};
    chats.forEach((chat) => {
      const otherUserId = chat.participants.find(
        (p) => p.toString() !== userId.toString()
      );
      if (!otherUserId) return;

      const unreadCount = chat.messages.filter(
        (msg) => msg.senderId.toString() !== userId.toString() && !msg.seen
      ).length;

      if (unreadCount > 0) {
        unreadCounts[otherUserId.toString()] = unreadCount;
      }
    });

    res.json(unreadCounts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = chatRouter;
