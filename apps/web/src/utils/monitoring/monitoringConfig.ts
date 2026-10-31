export type BrowserMonitoringConfig = {
  dsn: string | undefined;
  environment: string;
  release: string;
  sampleRate: number;
};

export const parseSampleRate = (raw: string | undefined, fallback: number): number => {
  if (raw === undefined || raw.trim() === "") return fallback;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 && value <= 1 ? value : fallback;
};

/** NEXT_PUBLIC_* values are inlined at build time, so they must be referenced literally here. */
export function readBrowserMonitoringConfig(): BrowserMonitoringConfig {
  return {
    dsn: process.env.NEXT_PUBLIC_BETTERSTACK_ERRORS_DSN?.trim() || undefined,
    environment: process.env.NEXT_PUBLIC_APP_ENV?.trim() || process.env.NODE_ENV || "development",
    release: process.env.NEXT_PUBLIC_APP_RELEASE?.trim() || "dev",
    sampleRate: parseSampleRate(process.env.NEXT_PUBLIC_BETTERSTACK_ERRORS_SAMPLE_RATE, 1),
  };
}
