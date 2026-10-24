import { TLS_EXEMPT_HOSTS } from "../consts/database";

const POSTGRES_PROTOCOLS = new Set(["postgres:", "postgresql:"]);
const INSECURE_SSL_MODES = new Set(["disable", "allow", "prefer"]);
const DATABASE_URL_PATTERN = /postgres(?:ql)?:\/\/[^\s"'`]+/gi;
const NEON_ENDPOINT_PATTERN = /^ep-[^.]+?(-pooler)?(?=\.)/;

export type SanitizedDbError = { code?: string; message: string };

/** Validates a connection URL from the environment; errors name the variable, never its value. */
export const parseDatabaseUrl = (key: string, value: string): string => {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`Invalid environment variable ${key}: expected a postgres:// connection URL`);
  }
  if (!POSTGRES_PROTOCOLS.has(url.protocol) || !url.hostname) {
    throw new Error(`Invalid environment variable ${key}: expected a postgres:// connection URL`);
  }
  return value;
};

/** Log-safe label such as `ep-***-pooler.c-7.us-east-2.aws.neon.tech/neondb` (no credentials, no params). */
export const describeDatabaseUrl = (value: string): string => {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(NEON_ENDPOINT_PATTERN, (_, pooler?: string) => `ep-***${pooler ?? ""}`);
    return `${host}${url.pathname}`;
  } catch {
    return "<invalid database url>";
  }
};

/**
 * Remote databases must use certificate- and hostname-verified TLS. `sslmode=require` is pinned to
 * `verify-full` so node-postgres keeps verifying once its libpq-compatible `require` semantics land.
 */
export const withVerifiedTls = (value: string): string => {
  const url = new URL(value);
  if (TLS_EXEMPT_HOSTS.includes(url.hostname)) return value;
  const sslMode = url.searchParams.get("sslmode");
  if (sslMode && INSECURE_SSL_MODES.has(sslMode)) {
    throw new Error(`Database ${describeDatabaseUrl(value)} requires TLS: sslmode=${sslMode} is not allowed`);
  }
  url.searchParams.set("sslmode", "verify-full");
  return url.toString();
};

export const redactDatabaseUrls = (text: string): string =>
  text.replace(DATABASE_URL_PATTERN, "postgres://<redacted>");

/** Error code + message only: driver errors can carry connection details in extra fields. */
export const sanitizeDbError = (err: unknown): SanitizedDbError => {
  if (!(err instanceof Error)) return { message: redactDatabaseUrls(String(err)) };
  const code = (err as { code?: unknown }).code;
  const message = redactDatabaseUrls(err.message);
  return typeof code === "string" ? { code, message } : { message };
};
