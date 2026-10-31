import type { LevelWithSilent } from "pino";

export type ObservabilityConfig = {
  environment: string;
  release: string | undefined;
  errorsDsn: string | undefined;
  errorsSampleRate: number;
  tracesSampleRate: number;
  logLevel: LevelWithSilent;
  betterStackLogLevel: LevelWithSilent;
  logsSourceToken: string | undefined;
  logsIngestingHost: string | undefined;
};

const LEVELS: readonly LevelWithSilent[] = ["fatal", "error", "warn", "info", "debug", "trace", "silent"];

const nonEmpty = (value: string | undefined) => (value && value.trim() ? value.trim() : undefined);

/** A rate in [0, 1]; anything else falls back so a typo can never disable sampling limits. */
export const parseRate = (raw: string | undefined, fallback: number): number => {
  if (raw === undefined || raw.trim() === "") return fallback;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 && value <= 1 ? value : fallback;
};

const parseLevel = (raw: string | undefined, fallback: LevelWithSilent): LevelWithSilent => {
  const value = raw?.trim().toLowerCase();
  return value && (LEVELS as readonly string[]).includes(value) ? (value as LevelWithSilent) : fallback;
};

/** Reads monitoring settings straight from the environment; never throws, so telemetry can't block startup. */
export function readObservabilityConfig(env: NodeJS.ProcessEnv = process.env): ObservabilityConfig {
  return {
    environment: nonEmpty(env.APP_ENV) ?? env.NODE_ENV ?? "development",
    release: nonEmpty(env.APP_RELEASE),
    errorsDsn: nonEmpty(env.BETTERSTACK_ERRORS_DSN),
    errorsSampleRate: parseRate(env.BETTERSTACK_ERRORS_SAMPLE_RATE, 1),
    tracesSampleRate: parseRate(env.BETTERSTACK_TRACES_SAMPLE_RATE, 0),
    logLevel: parseLevel(env.LOG_LEVEL, "info"),
    betterStackLogLevel: parseLevel(env.BETTERSTACK_LOG_LEVEL, "warn"),
    logsSourceToken: nonEmpty(env.BETTERSTACK_LOGS_SOURCE_TOKEN),
    logsIngestingHost: nonEmpty(env.BETTERSTACK_LOGS_INGESTING_HOST),
  };
}
