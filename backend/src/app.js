const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const apiRoutes = require("./routes");

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  app.get("/health", (req, res) => res.json({ ok: true }));

  app.use("/", apiRoutes);

  // Basic error handler
  app.use((err, req, res, next) => {
    // eslint-disable-next-line no-console
    console.error("[error]", err);
    res.status(err.statusCode || 500).json({
      error: err.message || "Internal Server Error",
    });
  });

  return app;
}

module.exports = { createApp };

