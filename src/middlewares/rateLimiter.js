const rateLimit = require("express-rate-limit");
const status = require("http-status");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: {
    status: status.TOO_MANY_REQUESTS,
    message: "Too many requests from this IP, please try again later.",
  },
});

module.exports = {
  authLimiter,
};
