const rateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const { createClient } = require("redis");
const status = require("http-status");

const RATE_LIMITS = {
  WINDOW_MS: 60 * 1000, // 1 min window
  MAX_REQUESTS: 40, // 40 requests per window
  BLOCK_DURATION: 24 * 60 * 60, // 24 hours block
  FAILED_ATTEMPTS: 5, // Max failed requests before block
  FAILED_WINDOW: 300, // 10 minutes failure tracking
};

async function createRedisClient() {
  const client = createClient({ url: process.env.REDIS_URL });
  client.on("error", console.error);
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
      prefix: "rl:",
    }),
    keyGenerator: (req) => `${req.headers["authorization"] || ""}:${req.ip}`,
    skip: (req) => (process.env.IP_WHITELIST || "").split(",").includes(req.ip),
    handler: async (req, res) => {
      await redisClient.set(`blocked:${req.ip}`, "1", {
        EX: RATE_LIMITS.BLOCK_DURATION,
      });
      res
        .status(status.TOO_MANY_REQUESTS)
        .json({ message: "Too many requests. Please try again later." });
    },
  });

  const securityCheck = async (req, res, next) => {
    if (await redisClient.get(`blocked:${req.ip}`)) {
      return res
        .status(status.TOO_MANY_REQUESTS)
        .json({ message: "Access temporarily blocked." });
    }
    if (!req.headers["authorization"]) {
      await trackFailedAttempt(req.ip, redisClient);
      return res
        .status(status.UNAUTHORIZED)
        .json({ message: "Authorization token is required" });
    }
    next();
  };

  async function trackFailedAttempt(ip, client) {
    const key = `failed_attempts:${ip}`;
    const attempts = (parseInt(await client.get(key)) || 0) + 1;
    if (attempts >= RATE_LIMITS.FAILED_ATTEMPTS) {
      await client.set(`blocked:${ip}`, "1", {
        EX: RATE_LIMITS.BLOCK_DURATION,
      });
    } else {
      await client.set(key, attempts, { EX: RATE_LIMITS.FAILED_WINDOW });
    }
  }

  return [securityCheck, rateLimiter];
}

module.exports = setupRateLimiter;
