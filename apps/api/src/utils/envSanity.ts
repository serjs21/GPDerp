const REQUIRED_ENV_KEYS = [
  "JWT_ACCESS_SECRET",
  "ACCESS_TOKEN_TTL_SECONDS",
  "REFRESH_TOKEN_TTL_SECONDS",
  "SESSION_TTL_SECONDS",
  "TOKEN_HASH_PEPPER",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_PUBLIC_BASE_URL",
  "PADDLE_API_KEY",
  "PADDLE_WEBHOOK_SECRET",
  "PADDLE_ENV",
  "PADDLE_PRICE_ID_100_HAIKUS",
] as const;

const hasValue = (value: string | undefined) => typeof value === "string" && value.trim().length > 0;

export type EnvSanityResult = {
  missing: string[];
};

export const collectMissingRequiredEnv = (source: NodeJS.ProcessEnv = process.env): EnvSanityResult => {
  const missing = REQUIRED_ENV_KEYS.filter((key) => !hasValue(source[key]));
  return { missing: [...missing] };
};

export const assertRequiredEnv = (source: NodeJS.ProcessEnv = process.env): void => {
  const { missing } = collectMissingRequiredEnv(source);
  if (!missing.length) return;

  const missingList = missing.map((key) => `- ${key}`).join("\n");
  throw new Error(
    `Missing required environment variables for API startup:\n${missingList}\n\n` +
      "Copy apps/api/.env.example to apps/api/.env and fill the missing values.",
  );
};
