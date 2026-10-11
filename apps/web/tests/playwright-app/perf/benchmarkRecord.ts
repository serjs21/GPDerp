import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Browser, Page } from "playwright/test";

export type BenchmarkEnvironment = {
  gitSha: string;
  gitDirty: boolean;
  buildId: string;
  nodeEnv: "production";
  browser: string;
  viewport: string;
  cpuThrottle: number;
  platform: string;
  timestamp: string;
};

export type BenchmarkRecord = {
  name: string;
  scenario: string;
  datasetSize: number;
  runs: number;
  unit: "ms";
  samples: number[];
  median: number;
  p95: number;
  extra: Record<string, number>;
  environment: BenchmarkEnvironment;
};

/** Measured runs per tier (a discarded warm-up run is added on top). */
export const PERF_RUNS = Number(process.env.PERF_RUNS ?? 7);
export const PERF_CPU_THROTTLE = Number(process.env.PERF_CPU_THROTTLE ?? 1);

/** Outside Playwright's `test-results/` outputDir, which is emptied at the start of every run. */
const RECORD_DIR = path.join(process.cwd(), "perf-records");
const round = (value: number) => Math.round(value * 10) / 10;

export function median(samples: number[]): number {
  const sorted = [...samples].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

/** Nearest-rank percentile. */
export function percentile(samples: number[], p: number): number {
  const sorted = [...samples].sort((a, b) => a - b);
  const rank = Math.max(1, Math.ceil((p / 100) * sorted.length));
  return sorted[rank - 1]!;
}

function git(command: string): string {
  try {
    return execSync(`git ${command}`, { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

export function captureEnvironment(browser: Browser, page: Page): BenchmarkEnvironment {
  const buildIdPath = path.join(process.cwd(), ".next", "BUILD_ID");
  const viewport = page.viewportSize();
  return {
    gitSha: git("rev-parse --short HEAD"),
    gitDirty: git("status --porcelain -- src").length > 0,
    buildId: existsSync(buildIdPath) ? readFileSync(buildIdPath, "utf8").trim() : "unknown",
    nodeEnv: "production",
    browser: `${browser.browserType().name()} ${browser.version()}`,
    viewport: viewport ? `${viewport.width}x${viewport.height}` : "unknown",
    cpuThrottle: PERF_CPU_THROTTLE,
    platform: `${os.platform()} ${os.arch()} ${os.cpus()[0]?.model ?? ""}`.trim(),
    timestamp: new Date().toISOString(),
  };
}

export function buildRecord(
  fields: Omit<BenchmarkRecord, "runs" | "unit" | "median" | "p95" | "samples"> & { samples: number[] },
): BenchmarkRecord {
  const samples = fields.samples.map(round);
  return {
    ...fields,
    runs: samples.length,
    unit: "ms",
    samples,
    median: round(median(samples)),
    p95: round(percentile(samples, 95)),
  };
}

/** Writes `perf-records/<name>-<size>.json` and returns the path. */
export function writeRecord(record: BenchmarkRecord): string {
  mkdirSync(RECORD_DIR, { recursive: true });
  const file = path.join(RECORD_DIR, `${record.name.replace(/[^\w-]+/g, "_")}-${record.datasetSize}.json`);
  writeFileSync(file, `${JSON.stringify(record, null, 2)}\n`);
  return file;
}
