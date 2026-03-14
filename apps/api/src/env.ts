import "dotenv/config";

export const env = {
  PORT: Number(process.env.PORT ?? 3001),
  HOST: process.env.HOST ?? "0.0.0.0",

  CORS_ORIGIN: (process.env.CORS_ORIGIN ?? "").split(",").map((s) => s.trim()),
  CORS_METHODS: (process.env.CORS_METHODS ?? "GET,POST,OPTIONS")
    .split(",")
    .map((s) => s.trim()),
  CORS_HEADERS: (process.env.CORS_HEADERS ?? "Content-Type")
    .split(",")
    .map((s) => s.trim()),

  CORS_CREDENTIALS: process.env.CORS_CREDENTIALS === "true",
};
