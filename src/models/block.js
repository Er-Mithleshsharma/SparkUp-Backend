const mongoose = require("mongoose");

const blockSchema = new mongoose.Schema(
  {
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blockedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      enum: ["spam", "harassment", "inappropriate", "fake_profile", "other"],
      default: "other",
    },
    reportMessage: {
      type: String,
      maxLength: 500,
    },
  },
  { timestamps: true }
);

// Prevent duplicate blocks
blockSchema.index({ blockedBy: 1, blockedUser: 1 }, { unique: true });

const Block = mongoose.model("Block", blockSchema);
module.exports = Block;
