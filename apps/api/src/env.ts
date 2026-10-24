import "dotenv/config";
import { parseHaikuGenerationApi } from "./utils/haikuGenerationApi";
import { parseDatabaseUrl } from "./utils/databaseUrl";

const toList = (value: string) => value.split(",").map((s) => s.trim());
/** Headers the web client always sends; must survive any CORS_HEADERS override. */
const REQUIRED_CORS_HEADERS = ["x-tab-id", "x-csrf-token"];
const withRequiredCorsHeaders = (headers: string[]) => {
  const present = new Set(headers.map((h) => h.toLowerCase()));
  return [...headers, ...REQUIRED_CORS_HEADERS.filter((h) => !present.has(h))];
};
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
const optionalNonNegativeIntEnv = (key: string, fallback: number) => {
  const raw = process.env[key];
  if (raw === undefined || raw === "") return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`Invalid environment variable ${key}: expected a non-negative integer`);
  }
  return parsed;
};
const requirePaddleEnv = (key: string) => {
  const value = requireEnv(key);
  if (value !== "sandbox" && value !== "production") {
    throw new Error(`Invalid environment variable ${key}: expected sandbox or production`);
  }
  return value;
};

export const env = {
  PORT: Number(process.env.PORT ?? 3001),
  HOST: process.env.HOST ?? "0.0.0.0",
  CLIENT_URL: process.env.CLIENT_URL ?? "http://localhost:3000",
  /** Proxies in front of the API whose X-Forwarded-For entry is trusted (Lightsail: its load balancer). */
  TRUST_PROXY_HOPS: optionalNonNegativeIntEnv("TRUST_PROXY_HOPS", 1),

  CORS_ORIGIN: toList(process.env.CLIENT_URL ?? "http://localhost:3000"),
  CORS_METHODS: toList(process.env.CORS_METHODS ?? "GET,POST,OPTIONS,PATCH,PUT,DELETE"),
  CORS_HEADERS: withRequiredCorsHeaders(toList(process.env.CORS_HEADERS ?? "Content-Type")),
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
  /**
   * Sender display name shown by mail clients next to MAIL_FROM (empty = bare address). Defaults to the
   * display name of the toaster@gpderp.party Google account, whose profile photo Gmail shows as the avatar.
   */
  MAIL_FROM_NAME: process.env.MAIL_FROM_NAME ?? "Notification Toaster",
  /** Neon pooled connection (PgBouncer, `-pooler` host): app query traffic through Prisma. */
  DATABASE_URL: parseDatabaseUrl("DATABASE_URL", requireEnv("DATABASE_URL")),
  /** Neon direct connection: Prisma Migrate and pg-boss (long-lived sessions). */
  DATABASE_URL_UNPOOLED: parseDatabaseUrl("DATABASE_URL_UNPOOLED", requireEnv("DATABASE_URL_UNPOOLED")),

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

  PADDLE_API_KEY: requireEnv("PADDLE_API_KEY"),
  PADDLE_WEBHOOK_SECRET: requireEnv("PADDLE_WEBHOOK_SECRET"),
  PADDLE_ENV: requirePaddleEnv("PADDLE_ENV"),
  /** Reject webhook deliveries not coming from Paddle's published IPs. Can only be disabled outside production. */
  PADDLE_WEBHOOK_IP_ALLOWLIST:
    process.env.NODE_ENV === "production" || toBool(process.env.PADDLE_WEBHOOK_IP_ALLOWLIST, true),
  PADDLE_PRICE_ID_100_HAIKUS: requireEnv("PADDLE_PRICE_ID_100_HAIKUS"),

  /** Haiku generation backend: `prod` streams from OpenAI, `dev` (default) streams the local mock. */
  HAIKU_GENERATION_API: parseHaikuGenerationApi(),
};
