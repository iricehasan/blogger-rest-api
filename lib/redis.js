const redis = require("redis");
const { logger } = require("../middleware/logger");

const client = redis.createClient({ url: process.env.REDIS_URL });

client.on("error", (err) => logger.error({ err }, "Redis error"));

client.connect();

module.exports = client;
