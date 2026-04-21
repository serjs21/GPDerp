import type { FastifyRequest } from "fastify";

/**
 * Best-effort country for security / notification emails.
 * Prefer Cloudflare (`CF-IPCountry`), then Vercel; otherwise "Unknown".
 */
export function resolveRequestCountryCode(request: FastifyRequest): string {
  const cf = request.headers["cf-ipcountry"];
  if (typeof cf === "string" && cf.length > 0 && cf !== "XX") {
    return cf.toUpperCase();
  }
  const vercel = request.headers["x-vercel-ip-country"];
  if (typeof vercel === "string" && vercel.length > 0) {
    return vercel.toUpperCase();
  }
  return "Unknown";
}

/** Human-readable region for security notification emails. */
export function formatCountryLabel(countryCode: string): string {
  if (!countryCode || countryCode === "Unknown") {
    return "an unknown location";
  }
  try {
    const label = new Intl.DisplayNames(["en"], { type: "region" }).of(countryCode);
    return label ? `${label} (${countryCode})` : countryCode;
  } catch {
    return countryCode;
  }
}
