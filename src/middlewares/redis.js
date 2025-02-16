const { createClient } = require("redis");

async function connectRedis() {
  try {
    const client = createClient({
      url: "redis://default:7pRMACWubhVNBse8x0ePzh2qdoDybbCs@redis-10379.c263.us-east-1-2.ec2.redns.redis-cloud.com:10379",
    });
    await client.connect();
    console.log("Redis connected");
    return client;
  } catch (error) {
    console.error("Redis connection failed:", error);
  }
}

module.exports = { connectRedis };
