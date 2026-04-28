import fs from "node:fs/promises";
import path from "node:path";
import { expect, test } from "playwright/test";

const STORY = "/iframe.html?id=suggested-authenticationnav-minimalstandaloneanimated--liquid-yin-yang-toggle-anime-waves&viewMode=story";
const OUT_DIR = path.join(process.cwd(), "local/suggested-yinyang-standalone/snapshots-liquid-toggle-anime-test");

test.describe("Suggested liquid anime waves toggle", () => {
  test("exports wave animation keyframes", async ({ page }) => {
    await fs.mkdir(OUT_DIR, { recursive: true });
    const existing = await fs.readdir(OUT_DIR);
    await Promise.all(existing.filter((name) => name.endsWith(".png")).map((name) => fs.unlink(path.join(OUT_DIR, name))));

    await page.goto(STORY);
    const toggle = page.getByTestId("yy-liquid-toggle-anime");
    await expect(toggle).toBeVisible();

    await toggle.screenshot({ path: path.join(OUT_DIR, "pw-anime--idle.png") });
    await page.waitForTimeout(700);
    await toggle.screenshot({ path: path.join(OUT_DIR, "pw-anime--idle-wave-shift.png") });

    await page.getByRole("button", { name: "Login" }).hover();
    await page.waitForTimeout(250);
    await toggle.screenshot({ path: path.join(OUT_DIR, "pw-anime--login-mid.png") });

    await page.getByRole("button", { name: "Register" }).hover();
    await page.waitForTimeout(250);
    await toggle.screenshot({ path: path.join(OUT_DIR, "pw-anime--register-mid.png") });
  });
});
