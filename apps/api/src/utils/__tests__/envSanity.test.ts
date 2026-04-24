import { assertRequiredEnv, collectMissingRequiredEnv } from "../envSanity";

describe("envSanity", () => {
  it("collects missing required keys", () => {
    const result = collectMissingRequiredEnv({
      JWT_ACCESS_SECRET: "secret",
      ACCESS_TOKEN_TTL_SECONDS: "900",
    } as NodeJS.ProcessEnv);

    expect(result.missing).toContain("REFRESH_TOKEN_TTL_SECONDS");
    expect(result.missing).toContain("R2_PUBLIC_BASE_URL");
  });

  it("passes when all required keys are present", () => {
    expect(() =>
      assertRequiredEnv({
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
      } as NodeJS.ProcessEnv),
    ).not.toThrow();
  });
});
