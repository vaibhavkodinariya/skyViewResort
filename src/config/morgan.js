const morgan = require("morgan");
const moment = require("moment-timezone");
const config = require("./config");
const logger = require("./logger");

morgan.token("message", (req, res) => res.locals.errorMessage || "");
morgan.token("timestamp", () =>
  moment().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm:ss A")
); // 12-hour format with AM/PM

const getIpFormat = () =>
  config.env === "production" ? ":remote-addr - " : "";
const successResponseFormat = `${getIpFormat()}[:timestamp] INFO: :method :url :status - :response-time ms`;
const errorResponseFormat = `${getIpFormat()}[:timestamp] ERROR: :method :url :status - :response-time ms - message: :message`;

const successHandler = morgan(successResponseFormat, {
  skip: (req, res) => res.statusCode >= 400,
  stream: { write: (message) => logger.info(message.trim()) },
});

const errorHandler = morgan(errorResponseFormat, {
  skip: (req, res) => res.statusCode < 400,
  stream: { write: (message) => logger.error(message.trim()) },
});

module.exports = {
  successHandler,
  errorHandler,
};
