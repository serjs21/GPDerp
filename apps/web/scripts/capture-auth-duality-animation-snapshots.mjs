import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const OUT_DIR = path.join(process.cwd(), "local/auth-duality/snapshots-animation");
const STORY_URL =
  "http://127.0.0.1:6006/iframe.html?id=components-authenticationnav-authdualitytoggle--default&viewMode=story";

async function run() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const existing = await fs.readdir(OUT_DIR);
  await Promise.all(existing.filter((f) => f.endsWith(".png")).map((f) => fs.unlink(path.join(OUT_DIR, f))));

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 560 } });
  await page.goto(STORY_URL, { waitUntil: "networkidle" });

  const toggle = page.getByTestId("auth-duality-toggle");
  await toggle.waitFor({ state: "visible" });
  await toggle.screenshot({ path: path.join(OUT_DIR, "anime--idle.png") });

  await page.getByRole("button", { name: "Login" }).hover();
  await page.waitForTimeout(220);
  await toggle.screenshot({ path: path.join(OUT_DIR, "anime--login-mid.png") });
  await page.waitForTimeout(900);
  await toggle.screenshot({ path: path.join(OUT_DIR, "anime--login-end.png") });

  await page.getByRole("button", { name: "Register" }).hover();
  await page.waitForTimeout(220);
  await toggle.screenshot({ path: path.join(OUT_DIR, "anime--register-mid.png") });
  await page.waitForTimeout(900);
  await toggle.screenshot({ path: path.join(OUT_DIR, "anime--register-end.png") });

  await browser.close();
  console.log(`Wrote snapshots to ${OUT_DIR}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
