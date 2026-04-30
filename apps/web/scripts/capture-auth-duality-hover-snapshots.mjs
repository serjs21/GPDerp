import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const OUT_DIR = path.join(process.cwd(), "local/auth-duality/snapshots-hover");
const STORY_URL =
  "http://127.0.0.1:6006/iframe.html?id=components-authenticationnav-authdualitytoggle--default&viewMode=story";

const HOVER_DURATION_MS = 200;
const TEXT_DURATION_MS = 280;

async function run() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const existing = await fs.readdir(OUT_DIR);
  await Promise.all(
    existing.filter((name) => name.endsWith(".png")).map((name) => fs.unlink(path.join(OUT_DIR, name))),
  );

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 560 } });
  await page.goto(STORY_URL, { waitUntil: "networkidle" });

  const toggle = page.getByTestId("auth-duality-toggle");
  await toggle.waitFor({ state: "visible" });

  const login = page.getByRole("button", { name: "Login" });
  const register = page.getByRole("button", { name: "Register" });

  await toggle.screenshot({ path: path.join(OUT_DIR, "liquid--idle.png") });

  await login.hover();
  await page.waitForTimeout(Math.round(HOVER_DURATION_MS * 0.5));
  await toggle.screenshot({ path: path.join(OUT_DIR, "liquid--login-hover-50.png") });
  await page.waitForTimeout(Math.round(TEXT_DURATION_MS));
  await toggle.screenshot({ path: path.join(OUT_DIR, "liquid--login-end.png") });

  const box = await toggle.boundingBox();
  if (!box) throw new Error("toggle bounding box missing");
  await page.mouse.move(box.x - 16, box.y + box.height / 2);
  await page.waitForTimeout(TEXT_DURATION_MS + 80);
  await toggle.screenshot({ path: path.join(OUT_DIR, "liquid--reset-idle.png") });

  await register.hover();
  await page.waitForTimeout(Math.round(HOVER_DURATION_MS * 0.5));
  await toggle.screenshot({ path: path.join(OUT_DIR, "liquid--register-hover-50.png") });
  await page.waitForTimeout(Math.round(TEXT_DURATION_MS));
  await toggle.screenshot({ path: path.join(OUT_DIR, "liquid--register-end.png") });

  await browser.close();
  console.log(`Wrote snapshots to ${OUT_DIR}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
