import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const OUT_DIR = path.join(process.cwd(), "local/suggested-yinyang-standalone/snapshots");
const STORY_URL =
  "http://127.0.0.1:6006/iframe.html?id=suggested-authenticationnav-minimalstandaloneanimated--animated&viewMode=story";
const DURATION_MS = 2000;

async function run() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const existing = await fs.readdir(OUT_DIR);
  await Promise.all(
    existing.filter((name) => name.endsWith(".png")).map((name) => fs.unlink(path.join(OUT_DIR, name))),
  );

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 900, height: 400 } });
  await page.goto(STORY_URL, { waitUntil: "networkidle" });

  const pill = page.locator(".yy-pill");
  const login = page.getByRole("button", { name: "Login" });
  const register = page.getByRole("button", { name: "Register" });

  await pill.waitFor({ state: "visible" });
  await pill.screenshot({ path: path.join(OUT_DIR, "standalone--idle.png") });

  const samplePoints = [0.1, 0.25, 0.45, 0.7, 1];
  let elapsed = 0;
  await login.hover();
  for (const point of samplePoints) {
    const wait = Math.max(0, Math.round(DURATION_MS * point - elapsed));
    await page.waitForTimeout(wait);
    elapsed += wait;
    await pill.screenshot({ path: path.join(OUT_DIR, `standalone--login-${Math.round(point * 100)}.png`) });
  }

  const box = await pill.boundingBox();
  if (!box) throw new Error("pill box missing");
  await page.mouse.move(box.x - 12, box.y + box.height / 2);
  await page.waitForTimeout(DURATION_MS + 80);
  await pill.screenshot({ path: path.join(OUT_DIR, "standalone--idle-reset.png") });

  elapsed = 0;
  await register.hover();
  for (const point of samplePoints) {
    const wait = Math.max(0, Math.round(DURATION_MS * point - elapsed));
    await page.waitForTimeout(wait);
    elapsed += wait;
    await pill.screenshot({
      path: path.join(OUT_DIR, `standalone--register-${Math.round(point * 100)}.png`),
    });
  }

  await browser.close();
  console.log(`Wrote snapshots to ${OUT_DIR}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

