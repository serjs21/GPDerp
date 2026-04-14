import "dotenv/config";

const toList = (value: string) => value.split(",").map((s) => s.trim());
const toBool = (value: string | undefined, fallback = false) => {
  if (value === undefined) return fallback;
  return value === "true";
};
const requireEnv = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};
const requirePositiveIntEnv = (key: string) => {
  const raw = requireEnv(key);
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid environment variable ${key}: expected a positive integer`);
  }
  return parsed;
};
const requireMinLengthEnv = (key: string, minLength: number) => {
  const value = requireEnv(key);
  if (value.length < minLength) {
    throw new Error(`Invalid environment variable ${key}: expected at least ${minLength} characters`);
  }
  return value;
};

export const env = {
  PORT: Number(process.env.PORT ?? 3001),
  HOST: process.env.HOST ?? "0.0.0.0",
  CLIENT_URL: process.env.CLIENT_URL ?? "http://localhost:3000",

  CORS_ORIGIN: toList(process.env.CLIENT_URL ?? "http://localhost:3000"),
  CORS_METHODS: toList(process.env.CORS_METHODS ?? "GET,POST,OPTIONS,PATCH,PUT,DELETE"),
  CORS_HEADERS: toList(process.env.CORS_HEADERS ?? "Content-Type"),
  CORS_CREDENTIALS: toBool(process.env.CORS_CREDENTIALS, true),

  JWT_ACCESS_SECRET: requireMinLengthEnv("JWT_ACCESS_SECRET", 32),
  ACCESS_TOKEN_TTL_SECONDS: requirePositiveIntEnv("ACCESS_TOKEN_TTL_SECONDS"),
  REFRESH_TOKEN_TTL_SECONDS: requirePositiveIntEnv("REFRESH_TOKEN_TTL_SECONDS"),
  SESSION_TTL_SECONDS: requirePositiveIntEnv("SESSION_TTL_SECONDS"),
  TOKEN_HASH_PEPPER: requireMinLengthEnv("TOKEN_HASH_PEPPER", 16),

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",

  WEB_APP_URL: process.env.WEB_APP_URL ?? process.env.CLIENT_URL ?? "http://localhost:3000",
  API_BASE_URL: process.env.API_BASE_URL ?? "http://localhost:4000",

  SMTP_HOST: process.env.SMTP_HOST ?? "",
  SMTP_PORT: Number(process.env.SMTP_PORT ?? 587),
  SMTP_SECURE: toBool(process.env.SMTP_SECURE, false),
  SMTP_USER: process.env.SMTP_USER ?? "",
  SMTP_PASS: process.env.SMTP_PASS ?? "",
  MAIL_FROM: process.env.MAIL_FROM ?? "",
  POSTGRES_USER: process.env.POSTGRES_USER ?? "haiku_user",
POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD ?? "haiku_pass_123",
POSTGRES_DB: process.env.POSTGRES_DB ?? "haiku_db",

POSTGRES_HOST: process.env.POSTGRES_HOST ?? "localhost",
POSTGRES_PORT: process.env.POSTGRES_PORT ?? "5433",

  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || undefined,
  COOKIE_SECURE: toBool(process.env.COOKIE_SECURE, process.env.NODE_ENV === "production"),
  COOKIE_SAME_SITE: (process.env.COOKIE_SAME_SITE ?? "lax") as
    | "lax"
    | "strict"
    | "none",

  R2_ACCOUNT_ID: requireEnv("R2_ACCOUNT_ID"),
  R2_ACCESS_KEY_ID: requireEnv("R2_ACCESS_KEY_ID"),
  R2_SECRET_ACCESS_KEY: requireEnv("R2_SECRET_ACCESS_KEY"),
  R2_BUCKET_NAME: requireEnv("R2_BUCKET_NAME"),
  R2_PUBLIC_BASE_URL: requireEnv("R2_PUBLIC_BASE_URL"),
  R2_REGION: process.env.R2_REGION ?? "auto",
  R2_S3_ENDPOINT:
    process.env.R2_S3_ENDPOINT ??
    `https://${requireEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
};
