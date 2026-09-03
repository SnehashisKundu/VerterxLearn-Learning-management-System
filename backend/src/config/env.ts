import "dotenv/config";

const getEnv = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`${key} is not defined`);
  }

  return value;
};

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",

  databaseUrl: getEnv("DATABASE_URL"),
  redisUrl: getEnv("REDIS_URL"),

  jwtAccessSecret: getEnv("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: getEnv("JWT_REFRESH_SECRET"),

  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
} as const;