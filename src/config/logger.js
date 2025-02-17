const winston = require("winston");
const config = require("./config");
const moment = require("moment-timezone");

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

// Custom timestamp function for 12-hour format with AM/PM
const timestampFormat = () =>
  moment().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm:ss A");

const logger = winston.createLogger({
  level: config.env === "development" ? "debug" : "info",
  format: winston.format.combine(
    enumerateErrorFormat(),
    config.env === "development"
      ? winston.format.colorize()
      : winston.format.uncolorize(),
    winston.format.splat(),
    winston.format.timestamp({ format: timestampFormat }), // Add timestamp
    winston.format.printf(
      ({ timestamp, level, message }) => `[${timestamp}] ${level}: ${message}`
    )
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ["error"],
    }),
    new winston.transports.File({
      filename: `logs/error-${moment()
        .tz("Asia/Kolkata")
        .format("MM-DD-YYYY")}.log`,
      level: "error",
    }),
  ],
});

module.exports = logger;
