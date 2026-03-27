const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema(
  {
    tokenNumber: { type: Number, required: true, index: true },
    queueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Queue",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["waiting", "completed", "skipped"],
      default: "waiting",
      index: true,
    },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

TokenSchema.index({ queueId: 1, tokenNumber: 1 }, { unique: true });

module.exports = mongoose.model("Token", TokenSchema);

