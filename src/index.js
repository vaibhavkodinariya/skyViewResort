const mongoose = require("mongoose");
const app = require("./app");
const config = require("./config/config");
const logger = require("./config/logger");
const https = require("https");
const http = require("http");
const fs = require("fs");

const sslOptions = {
  key: fs.readFileSync("./certs/privkey.pem"),
  cert: fs.readFileSync("./certs/fullchain.pem"),
};

let server;
mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  logger.info("Connected to MongoDB");
  server = https.createServer(sslOptions, app).listen(config.port, () => {
    logger.info(`Secure server listening on https://localhost:${config.port}`);
  });
  http
    .createServer((req, res) => {
      res.writeHead(301, {
        Location: `https://${req.headers.host}${req.url}`,
      });
      res.end();
    })
    .listen(6000, () => {
      logger.info("HTTP to HTTPS redirect server running on port 80");
    });
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
  logger.info("SIGTERM received");
  if (server) {
    server.close();
  }
});
