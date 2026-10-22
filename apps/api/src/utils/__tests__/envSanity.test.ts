import { assertRequiredEnv, collectMissingRequiredEnv } from "../envSanity";

describe("envSanity", () => {
  it("collects missing required keys", () => {
    const result = collectMissingRequiredEnv({
      JWT_ACCESS_SECRET: "secret",
      ACCESS_TOKEN_TTL_SECONDS: "900",
    } as NodeJS.ProcessEnv);

    expect(result.missing).toContain("REFRESH_TOKEN_TTL_SECONDS");
    expect(result.missing).toContain("R2_PUBLIC_BASE_URL");
    expect(result.missing).toContain("PADDLE_WEBHOOK_SECRET");
    expect(result.missing).toContain("DATABASE_URL");
    expect(result.missing).toContain("DATABASE_URL_UNPOOLED");
  });

  it("passes when all required keys are present", () => {
    expect(() =>
      assertRequiredEnv({
        DATABASE_URL: "postgresql://user:pass@ep-x-pooler.example.neon.tech/db",
        DATABASE_URL_UNPOOLED: "postgresql://user:pass@ep-x.example.neon.tech/db",
        JWT_ACCESS_SECRET: "secret",
        ACCESS_TOKEN_TTL_SECONDS: "900",
        REFRESH_TOKEN_TTL_SECONDS: "900",
        SESSION_TTL_SECONDS: "900",
        TOKEN_HASH_PEPPER: "pepper",
        R2_ACCOUNT_ID: "id",
        R2_ACCESS_KEY_ID: "key",
        R2_SECRET_ACCESS_KEY: "secret",
        R2_BUCKET_NAME: "bucket",
        R2_PUBLIC_BASE_URL: "https://example.com",
        PADDLE_API_KEY: "paddle-api-key",
        PADDLE_WEBHOOK_SECRET: "paddle-webhook-secret",
        PADDLE_ENV: "sandbox",
        PADDLE_PRICE_ID_100_HAIKUS: "pri_100_haiku",
      } as NodeJS.ProcessEnv),
    ).not.toThrow();
  });
});
