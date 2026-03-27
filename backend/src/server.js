const http = require("http");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
dotenv.config();

const { connectDB } = require("./db");
const { createApp } = require("./app");
const { setupSocket } = require("./socket/setupSocket");


async function start() {
  await connectDB();

  const app = createApp();
  app.set("io", null);
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  app.set("io", io);
  setupSocket(io);

  const port = process.env.PORT || 5000;
  server.listen(port, () => {

    console.log(`[server] Listening on :${port}`);
  });
}

start().catch((err) => {

  console.error("[server] Failed to start:", err);
  process.exit(1);
});

