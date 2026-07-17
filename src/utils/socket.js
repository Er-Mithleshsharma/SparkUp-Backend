const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("$"))
    .digest("hex");
};

const initializeSocket = (server) => {
  // TODO: restrict to specific origins in production
  const io = socket(server, {
    cors: {
      origin: true,
    },
  });

  const onlineUsers = new Map(); // Track online users

  io.on("connection", (socket) => {
    // Track when a user goes online
    socket.on("userOnline", (userId) => {
      onlineUsers.set(userId, socket.id);
      io.emit("onlineStatus", { userId, isOnline: true });

      // Send the full list of currently online users to the newly connected user
      const onlineList = Array.from(onlineUsers.keys());
      socket.emit("currentOnlineUsers", onlineList);
    });

    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      console.log(firstName + " joined Room : " + roomId);
      socket.join(roomId);

      // Notify the other user in the chat about the online status
      if (onlineUsers.has(targetUserId)) {
        socket.emit("onlineStatus", { userId: targetUserId, isOnline: true });
      }
    });

    socket.on("typing", ({ userId, targetUserId, isTyping }) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      socket.to(roomId).emit("userTyping", { userId, isTyping });
    });

    socket.on(
      "sendMessage",
      async ({ firstName, lastName, userId, targetUserId, text, replyTo }) => {
        try {
          const roomId = getSecretRoomId(userId, targetUserId);

          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: [],
            });
          }

          const messageData = { senderId: userId, text };
          if (replyTo) {
            messageData.replyTo = replyTo;
          }

          chat.messages.push(messageData);
          await chat.save();

          const savedMessage = chat.messages[chat.messages.length - 1];

          io.to(roomId).emit("messageReceived", {
            _id: savedMessage._id,
            firstName,
            lastName,
            text,
            replyTo: replyTo || null,
            createdAt: new Date(),
          });
        } catch (err) {
          console.log(err);
        }
      }
    );

    // Delete a message
    socket.on("deleteMessage", async ({ userId, targetUserId, messageId }) => {
      try {
        const roomId = getSecretRoomId(userId, targetUserId);

        const chat = await Chat.findOne({
          participants: { $all: [userId, targetUserId] },
        });

        if (!chat) return;

        // Find the message and verify sender
        const message = chat.messages.id(messageId);
        if (!message) return;
        if (message.senderId.toString() !== userId) return; // Only sender can delete

        // Remove the message
        chat.messages.pull(messageId);
        await chat.save();

        // Notify both users
        io.to(roomId).emit("messageDeleted", { messageId });
      } catch (err) {
        console.log(err);
      }
    });

    // React to a message
    socket.on("reactToMessage", async ({ userId, targetUserId, messageId, emoji }) => {
      try {
        const roomId = getSecretRoomId(userId, targetUserId);

        const chat = await Chat.findOne({
          participants: { $all: [userId, targetUserId] },
        });

        if (!chat) return;

        const message = chat.messages.id(messageId);
        if (!message) return;

        // Remove existing reaction from this user (toggle behavior)
        const existingIndex = message.reactions.findIndex(
          (r) => r.userId.toString() === userId && r.emoji === emoji
        );

        if (existingIndex > -1) {
          message.reactions.splice(existingIndex, 1);
        } else {
          // Remove any previous reaction from this user
          message.reactions = message.reactions.filter(
            (r) => r.userId.toString() !== userId
          );
          message.reactions.push({ userId, emoji });
        }

        await chat.save();

        io.to(roomId).emit("messageReaction", {
          messageId,
          reactions: message.reactions,
        });
      } catch (err) {
        console.log(err);
      }
    });

    // Mark messages as seen
    socket.on("markSeen", async ({ userId, targetUserId }) => {
      try {
        const roomId = getSecretRoomId(userId, targetUserId);

        const chat = await Chat.findOne({
          participants: { $all: [userId, targetUserId] },
        });

        if (!chat) return;

        // Mark all messages from targetUser as seen
        let updated = false;
        chat.messages.forEach((msg) => {
          if (msg.senderId.toString() === targetUserId && !msg.seen) {
            msg.seen = true;
            updated = true;
          }
        });

        if (updated) {
          await chat.save();
          io.to(roomId).emit("messagesSeen", { seenBy: userId });
        }
      } catch (err) {
        console.log(err);
      }
    });

    // Track when a user goes offline
    socket.on("disconnect", () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          io.emit("onlineStatus", { userId, isOnline: false }); // Notify all clients
          break;
        }
      }
    });
  });
};

module.exports = initializeSocket;