import "dotenv/config";
import { createClient } from "redis";

export const redis = createClient({
  url: process.env.REDIS_URL || "",
});

redis.on("error", (error) => {
  console.error("Redis Client Error:", error);
});