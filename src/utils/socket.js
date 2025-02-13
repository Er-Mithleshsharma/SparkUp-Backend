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
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  const onlineUsers = new Map(); // Track online users

  io.on("connection", (socket) => {
    // Track when a user goes online
    socket.on("userOnline", (userId) => {
      onlineUsers.set(userId, socket.id);
      io.emit("onlineStatus", { userId, isOnline: true }); // Notify all clients
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

    socket.on(
      "sendMessage",
      async ({ firstName, lastName, userId, targetUserId, text }) => {
        try {
          const roomId = getSecretRoomId(userId, targetUserId);
          console.log(firstName + " " + text);

          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: [],
            });
          }

          chat.messages.push({
            senderId: userId,
            text,
          });

          await chat.save();

          // Emit the message with the timestamp
          io.to(roomId).emit("messageReceived", {
            firstName,
            lastName,
            text,
            createdAt: new Date(),
          });
        } catch (err) {
          console.log(err);
        }
      }
    );

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