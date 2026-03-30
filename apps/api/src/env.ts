import "dotenv/config";

const toList = (value: string) => value.split(",").map((s) => s.trim());
const toBool = (value: string | undefined, fallback = false) => {
  if (value === undefined) return fallback;
  return value === "true";
};

export const env = {
  PORT: Number(process.env.PORT ?? 3001),
  HOST: process.env.HOST ?? "0.0.0.0",

  CORS_ORIGIN: toList(process.env.CORS_ORIGIN ?? ""),
  CORS_METHODS: toList(process.env.CORS_METHODS ?? "GET,POST,OPTIONS"),
  CORS_HEADERS: toList(process.env.CORS_HEADERS ?? "Content-Type"),
  CORS_CREDENTIALS: toBool(process.env.CORS_CREDENTIALS, true),

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? "dev_access_secret_change_me",
  ACCESS_TOKEN_TTL_SECONDS: Number(process.env.ACCESS_TOKEN_TTL_SECONDS ?? 900),
  REFRESH_TOKEN_TTL_SECONDS: Number(
    process.env.REFRESH_TOKEN_TTL_SECONDS ?? 60 * 60 * 24 * 30,
  ),
  SESSION_TTL_SECONDS: Number(process.env.SESSION_TTL_SECONDS ?? 60 * 60 * 24 * 30),
  TOKEN_HASH_PEPPER: process.env.TOKEN_HASH_PEPPER ?? "dev_token_pepper_change_me",

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",

  WEB_APP_URL: process.env.WEB_APP_URL ?? "http://localhost:3000",
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
};
