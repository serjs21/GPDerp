#!/usr/bin/env node
/**
 * `local/component-complexity` checks that ignore the legacy bulk suppressions.
 *
 * Changed mode (default): holds new or modified React components to the limit. A component counts as
 * modified when any changed line (git diff vs --base, plus untracked files) falls inside its function
 * range. Untouched legacy components in the same file are reported as informational only.
 *
 * Inventory mode (--all): lists every violating component (highest complexity first) and compares per-file
 * counts with eslint-suppressions.json — files over budget fail, files under budget are prunable.
 *
 * Usage (from apps/web):
 *   node scripts/lint-changed-components.mjs                 # working tree + index vs HEAD
 *   node scripts/lint-changed-components.mjs --base origin/main
 *   node scripts/lint-changed-components.mjs --all
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { ESLint } from "eslint";

const RULE_ID = "local/component-complexity";
const COMPONENT_FILE = /^src\/.*\.tsx$/;
const EXCLUDED_FILE = /\.(stories|test)\.tsx$/;
const SUPPRESSIONS_FILE = "eslint-suppressions.json";

function parseArgs(argv) {
  const baseIndex = argv.indexOf("--base");
  return { all: argv.includes("--all"), base: baseIndex === -1 ? "HEAD" : argv[baseIndex + 1] };
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

const isComponentFile = (file) => COMPONENT_FILE.test(file) && !EXCLUDED_FILE.test(file);

/** Map of file → array of [start, end] new-side line ranges (Infinity end = whole file). */
function collectChangedRanges(base) {
  const ranges = new Map();
  let current = null;
  for (const line of git(["diff", "-U0", "--relative", "--no-color", base, "--", "src"]).split("\n")) {
    if (line.startsWith("+++ ")) {
      current = line === "+++ /dev/null" ? null : line.slice(6);
      if (current && !ranges.has(current)) ranges.set(current, []);
      continue;
    }
    const hunk = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/.exec(line);
    if (hunk && current) {
      const start = Number(hunk[1]);
      const count = hunk[2] === undefined ? 1 : Number(hunk[2]);
      // Pure deletion: mark the lines on both sides of the removal point.
      ranges.get(current).push(count === 0 ? [start, start + 1] : [start, start + count - 1]);
    }
  }
  for (const file of git(["ls-files", "--others", "--exclude-standard", "--", "src"]).split("\n")) {
    if (file) ranges.set(file, [[1, Infinity]]);
  }
  return ranges;
}

const overlaps = (message, fileRanges) =>
  fileRanges.some(([start, end]) => start <= (message.endLine ?? message.line) && message.line <= end);

async function lintComponents(files) {
  const eslint = new ESLint({
    overrideConfig: {
      files: ["src/**/*.tsx"],
      ignores: ["**/*.stories.tsx", "**/*.test.tsx"],
      rules: { [RULE_ID]: ["error", { max: 5, reportRange: "function" }] },
    },
    ruleFilter: ({ ruleId }) => ruleId === RULE_ID,
  });
  const results = await eslint.lintFiles(files);
  return results.map((result) => ({
    file: path.relative(process.cwd(), result.filePath),
    messages: result.messages.filter((m) => m.ruleId === RULE_ID || m.fatal),
  }));
}

async function checkChanged(base) {
  const changed = [...collectChangedRanges(base)].filter(([file]) => isComponentFile(file));
  if (changed.length === 0) {
    console.log(`No changed component files vs ${base}.`);
    return 0;
  }
  const rangesByFile = new Map(changed);
  let failures = 0;
  let untouched = 0;
  for (const { file, messages } of await lintComponents(changed.map(([f]) => f))) {
    for (const message of messages) {
      if (message.fatal || overlaps(message, rangesByFile.get(file) ?? [])) {
        failures++;
        console.log(`FAIL ${file}:${message.line}  ${message.message}`);
      } else {
        untouched++;
        console.log(`info ${file}:${message.line}  (untouched legacy) ${message.message}`);
      }
    }
  }
  console.log(
    `\n${changed.length} changed component file(s) vs ${base}: ` +
      `${failures} failing modified component(s), ${untouched} untouched legacy violation(s).`,
  );
  return failures;
}

function readSuppressionBudget() {
  if (!existsSync(SUPPRESSIONS_FILE)) return {};
  const suppressions = JSON.parse(readFileSync(SUPPRESSIONS_FILE, "utf8"));
  return Object.fromEntries(
    Object.entries(suppressions).map(([file, rules]) => [file, rules[RULE_ID]?.count ?? 0]),
  );
}

async function inventory() {
  const results = await lintComponents(["src"]);
  const budget = readSuppressionBudget();
  const rows = results.flatMap(({ file, messages }) =>
    messages.map((m) => ({ file, line: m.line, message: m.message, complexity: Number(/complexity of (\d+)/.exec(m.message)?.[1] ?? 0) })),
  );
  rows.sort((a, b) => b.complexity - a.complexity || a.file.localeCompare(b.file));
  for (const row of rows) console.log(`${String(row.complexity).padStart(3)}  ${row.file}:${row.line}  ${row.message}`);

  const counts = {};
  for (const row of rows) counts[row.file] = (counts[row.file] ?? 0) + 1;
  const files = new Set([...Object.keys(counts), ...Object.keys(budget)]);
  let overBudget = 0;
  let prunable = 0;
  for (const file of [...files].sort()) {
    const actual = counts[file] ?? 0;
    const allowed = budget[file] ?? 0;
    if (actual > allowed) {
      overBudget++;
      console.log(`FAIL ${file}: ${actual} violation(s), ${allowed} suppressed`);
    } else if (actual < allowed) {
      prunable++;
      console.log(`prunable ${file}: ${actual} violation(s), ${allowed} suppressed — run pnpm lint:components:prune`);
    }
  }
  const suppressedTotal = Object.values(budget).reduce((sum, n) => sum + n, 0);
  console.log(
    `\n${rows.length} violating component(s) in ${Object.keys(counts).length} file(s); ` +
      `${suppressedTotal} suppressed; ${overBudget} file(s) over budget; ${prunable} prunable.`,
  );
  return overBudget;
}

async function main() {
  const { all, base } = parseArgs(process.argv.slice(2));
  const failures = all ? await inventory() : await checkChanged(base);
  if (failures > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 2;
});
