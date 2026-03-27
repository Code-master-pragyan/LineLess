const mongoose = require("mongoose");

const QueueSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true }, // doctor/counter name
    currentToken: { type: Number, default: 0, index: true },
    avgTimePerUser: { type: Number, default: 5 }, // minutes
  },
  { timestamps: true }
);

module.exports = mongoose.model("Queue", QueueSchema);

