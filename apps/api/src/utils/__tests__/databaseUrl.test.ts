import {
  describeDatabaseUrl,
  parseDatabaseUrl,
  redactDatabaseUrls,
  sanitizeDbError,
  withVerifiedTls,
} from "../databaseUrl";

const POOLED = "postgresql://app_user:npg_s3cr3tPass@ep-cool-name-a1b2c3-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const DIRECT = "postgresql://app_user:npg_s3cr3tPass@ep-cool-name-a1b2c3.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require";
const LOCAL = "postgresql://postgres:postgres@localhost:5433/gpderp?schema=public";

describe("parseDatabaseUrl", () => {
  it("returns valid postgres URLs unchanged", () => {
    expect(parseDatabaseUrl("DATABASE_URL", POOLED)).toBe(POOLED);
    expect(parseDatabaseUrl("DATABASE_URL", LOCAL)).toBe(LOCAL);
  });

  it("rejects malformed values without echoing them", () => {
    const value = "postgresql://user:npg_s3cr3tPass@@::bad host/db";
    expect(() => parseDatabaseUrl("DATABASE_URL", value)).toThrow(
      "Invalid environment variable DATABASE_URL: expected a postgres:// connection URL",
    );
    try {
      parseDatabaseUrl("DATABASE_URL", value);
    } catch (err) {
      expect(JSON.stringify(err, Object.getOwnPropertyNames(err))).not.toContain("npg_s3cr3tPass");
    }
  });

  it("rejects non-postgres URLs", () => {
    expect(() => parseDatabaseUrl("DATABASE_URL_UNPOOLED", "mysql://u:p@host/db")).toThrow(
      "DATABASE_URL_UNPOOLED",
    );
  });
});

describe("withVerifiedTls", () => {
  it("pins remote hosts to sslmode=verify-full and keeps other params", () => {
    const url = new URL(withVerifiedTls(POOLED));
    expect(url.searchParams.get("sslmode")).toBe("verify-full");
    expect(url.searchParams.get("channel_binding")).toBe("require");
    expect(url.password).toBe("npg_s3cr3tPass");
  });

  it("adds TLS when the remote URL has no sslmode", () => {
    const bare = DIRECT.replace("?sslmode=require", "");
    expect(new URL(withVerifiedTls(bare)).searchParams.get("sslmode")).toBe("verify-full");
  });

  it("leaves local hosts untouched", () => {
    expect(withVerifiedTls(LOCAL)).toBe(LOCAL);
    const docker = LOCAL.replace("localhost", "host.docker.internal");
    expect(withVerifiedTls(docker)).toBe(docker);
  });

  it.each(["disable", "allow", "prefer"])("refuses sslmode=%s for remote hosts without leaking credentials", (mode) => {
    const insecure = DIRECT.replace("sslmode=require", `sslmode=${mode}`);
    expect(() => withVerifiedTls(insecure)).toThrow(`sslmode=${mode} is not allowed`);
    expect(() => withVerifiedTls(insecure)).not.toThrow(/npg_s3cr3tPass|app_user/);
  });
});

describe("describeDatabaseUrl", () => {
  it("masks the Neon endpoint id and drops credentials and params", () => {
    expect(describeDatabaseUrl(POOLED)).toBe("ep-***-pooler.c-7.us-east-2.aws.neon.tech/neondb");
    expect(describeDatabaseUrl(DIRECT)).toBe("ep-***.c-7.us-east-2.aws.neon.tech/neondb");
    expect(describeDatabaseUrl(LOCAL)).toBe("localhost/gpderp");
  });

  it("never echoes invalid input", () => {
    expect(describeDatabaseUrl("not a url npg_s3cr3tPass")).toBe("<invalid database url>");
  });
});

describe("sanitizeDbError", () => {
  it("keeps the code and redacts connection URLs from the message", () => {
    const err = Object.assign(new Error(`connect failed for ${DIRECT}`), {
      code: "ECONNREFUSED",
      input: DIRECT,
    });
    const sanitized = sanitizeDbError(err);
    expect(sanitized).toEqual({ code: "ECONNREFUSED", message: "connect failed for postgres://<redacted>" });
    expect(JSON.stringify(sanitized)).not.toContain("npg_s3cr3tPass");
  });

  it("handles non-Error values", () => {
    expect(sanitizeDbError(`boom ${LOCAL}`)).toEqual({ message: "boom postgres://<redacted>" });
  });

  it("redacts every URL in a text", () => {
    expect(redactDatabaseUrls(`a ${POOLED} b ${LOCAL}`)).toBe("a postgres://<redacted> b postgres://<redacted>");
  });
});
