/**
 * Deletes app-unreachable code listed in scripts/cleanup/unusedComponents.manifest.json.
 *
 *   node scripts/cleanup-unused-components.mjs          # dry run (default)
 *   node scripts/cleanup-unused-components.mjs --apply  # delete
 *
 * Regenerate the manifest from `pnpm knip:app` when the app changes.
 */
import { existsSync, readFileSync, readdirSync, rmSync, rmdirSync, statSync } from "node:fs";
import { basename, dirname, extname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const manifestPath = join(__dirname, "cleanup/unusedComponents.manifest.json");
const apply = process.argv.includes("--apply");

const SOURCE_EXT = /\.(ts|tsx|mts|css)$/;
const SKIP_DIRS = new Set(["node_modules", ".next", "storybook-static", "public"]);

/** Colocated files that only exist for their component; imported as `./X.module.css` / `./X.types`. */
const REFERENCED_SIBLINGS = [".module.css", ".stories.module.css", ".types.d.ts"];
/** Never imported by app code, so they go with their component unconditionally. */
const AUX_SIBLINGS = [".stories.tsx", ".stories.ts", ".test.tsx", ".test.ts"];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function assertInsideRoot(path) {
  const rel = relative(root, path);
  if (!rel || rel.startsWith("..") || rel.split(sep).some((part) => SKIP_DIRS.has(part))) {
    throw new Error(`Refusing to delete outside the cleanup scope: ${path}`);
  }
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const missing = [];
const targets = new Set();

for (const dir of manifest.dirs) {
  const full = join(root, dir);
  if (!existsSync(full)) missing.push(dir);
  else for (const file of walk(full)) targets.add(file);
}

const manifestFiles = [];
for (const file of manifest.files) {
  const full = join(root, file);
  if (!existsSync(full)) missing.push(file);
  else {
    targets.add(full);
    manifestFiles.push(full);
  }
}

const isTarget = (file) => targets.has(file);
const srcSources = walk(join(root, "src")).filter((f) => SOURCE_EXT.test(f));
const contents = new Map(srcSources.map((f) => [f, readFileSync(f, "utf8")]));

function isReferenced(sibling, siblingName) {
  const needle = siblingName.replace(/\.d\.ts$/, "");
  return srcSources.some(
    (file) => file !== sibling && !isTarget(file) && contents.get(file).includes(needle),
  );
}

const candidates = [];
for (const file of manifestFiles) {
  const ext = extname(file);
  if (ext !== ".ts" && ext !== ".tsx") continue;
  const stem = basename(file, ext);
  const dir = dirname(file);

  for (const suffix of AUX_SIBLINGS) {
    const sibling = join(dir, stem + suffix);
    if (existsSync(sibling)) targets.add(sibling);
  }
  for (const suffix of REFERENCED_SIBLINGS) {
    const sibling = join(dir, stem + suffix);
    if (existsSync(sibling) && !isTarget(sibling)) candidates.push([sibling, stem + suffix]);
  }
}

// Siblings referenced only by other deleted siblings become deletable on a later pass.
let pending = candidates;
let progressed = true;
while (progressed) {
  progressed = false;
  const next = [];
  for (const [sibling, name] of pending) {
    if (isReferenced(sibling, name)) next.push([sibling, name]);
    else {
      targets.add(sibling);
      progressed = true;
    }
  }
  pending = next;
}
const skippedSiblings = pending.map(([sibling]) => sibling);

const sorted = [...targets].sort();
const rel = (p) => relative(root, p);

console.log(`${apply ? "Deleting" : "Would delete"} ${sorted.length} files:`);
for (const file of sorted) console.log(`  ${rel(file)}`);
if (skippedSiblings.length) {
  console.log(`\nKept ${skippedSiblings.length} colocated files still referenced elsewhere:`);
  for (const file of skippedSiblings) console.log(`  ${rel(file)}`);
}
if (missing.length) {
  console.warn(`\nWarning: ${missing.length} manifest entries no longer exist:`);
  for (const entry of missing) console.warn(`  ${entry}`);
}

if (!apply) {
  console.log("\nDry run. Re-run with --apply to delete.");
  process.exit(0);
}

for (const file of sorted) {
  assertInsideRoot(file);
  rmSync(file);
}

const touchedDirs = new Set(sorted.map(dirname));
let pruned = 0;
for (const start of [...touchedDirs].sort((a, b) => b.length - a.length)) {
  let dir = start;
  while (dir !== root && existsSync(dir) && readdirSync(dir).length === 0) {
    assertInsideRoot(dir);
    rmdirSync(dir);
    pruned += 1;
    dir = dirname(dir);
  }
}

console.log(`\nDeleted ${sorted.length} files and ${pruned} empty folders.`);
