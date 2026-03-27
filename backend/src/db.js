const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lineLessIndia";

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);

  // eslint-disable-next-line no-console
  console.log("[db] Connected: MongoDB Atlas");
}

module.exports = { connectDB };

