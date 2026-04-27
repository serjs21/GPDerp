import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { expectedStates, renderExpectedHtml } from "./auth-nav-expected-model.mjs";

const OUT_DIR = path.join(process.cwd(), "local/auth-nav-hover-expected");

async function run() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const oldFiles = await fs.readdir(OUT_DIR);
  await Promise.all(
    oldFiles.filter((n) => n.endsWith(".png")).map((n) => fs.unlink(path.join(OUT_DIR, n))),
  );

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 600, height: 280 } });

  for (const state of expectedStates) {
    const html = renderExpectedHtml(state);
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    const pill = page.locator(".pill");
    await pill.screenshot({ path: path.join(OUT_DIR, `expected--${state.name}.png`) });
  }

  await browser.close();
  console.log(`Wrote ${expectedStates.length} expected snapshots to ${OUT_DIR}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

