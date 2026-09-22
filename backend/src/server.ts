import "dotenv/config";

import { app } from "./app";
import { prisma } from "./lib/prisma";
import { redis } from "./lib/redis";

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("✅ PostgreSQL connected");

    await redis.connect();
    console.log("✅ Redis connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);

    await prisma.$disconnect();
    process.exit(1);
  }
}

async function shutdown() {
  console.log("\n🛑 Shutting down server...");

  await redis.quit();
  await prisma.$disconnect();

  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

startServer();