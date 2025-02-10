const rateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const { createClient } = require("redis");
const status = require("http-status");

// Moderate security rate limit settings
const RATE_LIMITS = {
  WINDOW_MS: 5 * 60 * 1000, // 5 minutes window
  MAX_REQUESTS: 10, // 150 requests per window
  BLOCK_DURATION: 15 * 60, // 15 minutes block
};

async function createRedisClient() {
  const client = createClient({
    url: process.env.REDIS_URL,
    socket: {
      connectTimeout: 5000,
      reconnectStrategy: (retries) => {
        if (retries > 5) return new Error("Redis max retries reached");
        return Math.min(retries * 500, 3000);
      },
    },
  });

  client.on("error", (err) => console.error("Redis Error:", err));
  client.on("connect", () => console.log("Connected to Redis"));

  await client.connect();
  return client;
}

async function setupRateLimiter() {
  const redisClient = await createRedisClient();

  const rateLimiter = rateLimit({
    windowMs: RATE_LIMITS.WINDOW_MS,
    max: RATE_LIMITS.MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,

    store: new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
      prefix: "rl:", // Redis key prefix
    }),

    // Use token and IP for rate limiting
    keyGenerator: (req) => {
      const token = req.headers["authorization"] || "";
      return `${token}:${req.ip}`;
    },

    // Skip rate limiting for whitelisted IPs
    skip: (req) => {
      const whitelist = process.env.IP_WHITELIST
        ? process.env.IP_WHITELIST.split(",")
        : [];
      return whitelist.includes(req.ip);
    },

    // Handle rate limit exceeded
    handler: async (req, res) => {
      const key = `blocked:${req.ip}`;

      // Block IP temporarily
      await redisClient.set(key, "1", {
        EX: RATE_LIMITS.BLOCK_DURATION,
      });

      res.status(status.TOO_MANY_REQUESTS).json({
        status: status.TOO_MANY_REQUESTS,
        message: "Too many requests. Please try again later.",
        retryAfter: RATE_LIMITS.WINDOW_MS / 1000,
      });
    },

    // Handle errors gracefully
    onError: async (err, req, res, next) => {
      console.error("Rate limiter error:", err);

      if (err.message === "Authorization required") {
        return res.status(status.UNAUTHORIZED).json({
          status: status.UNAUTHORIZED,
          message: "Authorization token is required",
        });
      }

      // On Redis error, allow the request
      next();
    },
  });

  // Basic security middleware
  const securityCheck = async (req, res, next) => {
    // Check if IP is blocked
    const isBlocked = await redisClient.get(`blocked:${req.ip}`);
    if (isBlocked) {
      return res.status(status.TOO_MANY_REQUESTS).json({
        status: status.TOO_MANY_REQUESTS,
        message: "Access temporarily blocked. Please try again later.",
      });
    }

    // Basic token check
    const token = req.headers["authorization"];
    if (!token) {
      return res.status(status.UNAUTHORIZED).json({
        status: status.UNAUTHORIZED,
        message: "Authorization token is required",
      });
    }

    next();
  };

  return [securityCheck, rateLimiter];
}

module.exports = setupRateLimiter;
