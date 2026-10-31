import pino, { type DestinationStream, type Logger, type LoggerOptions, type StreamEntry } from "pino";
import type { ObservabilityConfig } from "./config";

const SECRET_FIELDS = ["password", "currentPassword", "newPassword", "token", "accessToken", "refreshToken", "csrfToken"];

/** Credentials, session/tab identifiers and secret-bearing fields never reach any log destination. */
export const LOG_REDACT_PATHS = [
  "req.headers.cookie",
  "req.headers.authorization",
  'req.headers["x-csrf-token"]',
  'req.headers["x-tab-id"]',
  'req.headers["x-api-key"]',
  'req.headers["sec-websocket-protocol"]',
  'res.headers["set-cookie"]',
  ...SECRET_FIELDS,
  ...SECRET_FIELDS.map((field) => `*.${field}`),
];

export const loggerOptions = (level: LoggerOptions["level"]): LoggerOptions => ({
  level,
  redact: { paths: LOG_REDACT_PATHS, censor: "[redacted]" },
});

const reportTelemetryFailure = (message: string, err: unknown) => {
  const reason = err instanceof Error ? err.message : String(err);
  process.stderr.write(`[observability] ${message}: ${reason}\n`);
};

/**
 * Wraps a log stream so a failing remote collector (bad token, network, worker crash) is dropped
 * after the first error instead of throwing into request handling.
 */
export function failSafeStream(stream: DestinationStream & { on?: (event: "error", cb: (err: unknown) => void) => void }): DestinationStream {
  let failed = false;
  const fail = (err: unknown) => {
    if (failed) return;
    failed = true;
    reportTelemetryFailure("Better Stack log shipping disabled", err);
  };
  stream.on?.("error", fail);
  return {
    write(chunk: string) {
      if (failed) return;
      try {
        stream.write(chunk);
      } catch (err) {
        fail(err);
      }
    },
  };
}

const CLIENT_ADDRESS_FIELDS = ["ip", "ips", "remoteAddress", "remotePort"];

const dropClientAddress = (record: Record<string, unknown>) => {
  for (const field of CLIENT_ADDRESS_FIELDS) delete record[field];
};

/**
 * Removes client IP fields (e.g. from auth-failure warnings) from a log line before it leaves the
 * server; stdout keeps them for local abuse investigation.
 */
export function stripClientAddress(line: string): string {
  try {
    const record = JSON.parse(line) as Record<string, unknown>;
    dropClientAddress(record);
    if (record.req && typeof record.req === "object") dropClientAddress(record.req as Record<string, unknown>);
    return `${JSON.stringify(record)}\n`;
  } catch {
    return line;
  }
}

const withoutClientAddress = (stream: DestinationStream): DestinationStream => ({
  write: (chunk: string) => stream.write(stripClientAddress(chunk)),
});

const betterStackStream = (config: ObservabilityConfig): DestinationStream | null => {
  if (!config.logsSourceToken || !config.logsIngestingHost) return null;
  try {
    const transport = pino.transport({
      target: "@logtail/pino",
      options: {
        sourceToken: config.logsSourceToken,
        options: { endpoint: `https://${config.logsIngestingHost}` },
      },
    });
    return withoutClientAddress(failSafeStream(transport));
  } catch (err) {
    reportTelemetryFailure("Better Stack log transport could not start", err);
    return null;
  }
};

const lowerLevel = (a: pino.Level, b: pino.Level): pino.Level =>
  pino.levels.values[a] <= pino.levels.values[b] ? a : b;

/**
 * Stdout logger (unchanged behavior when Better Stack is not configured). With a Better Stack
 * source, only entries at `betterStackLogLevel` (default `warn`) and above are shipped remotely,
 * so routine successful request logs stay local.
 */
export function createLogger(config: ObservabilityConfig): Logger {
  const remote = betterStackStream(config);
  if (!remote || config.betterStackLogLevel === "silent") return pino(loggerOptions(config.logLevel));

  const stdoutLevel = config.logLevel === "silent" ? "fatal" : config.logLevel;
  const remoteLevel = config.betterStackLogLevel;
  const streams: StreamEntry[] = [
    { level: stdoutLevel, stream: pino.destination(1) },
    { level: remoteLevel, stream: remote },
  ];
  return pino(loggerOptions(lowerLevel(stdoutLevel, remoteLevel)), pino.multistream(streams));
}
