import fs from "node:fs/promises";
import path from "node:path";
import { test } from "playwright/test";

/** Keep in sync with `AUTH_NAV_YIN_HOVER_DUR_S` in LoggedOutAuthLinks.tsx */
const HOVER_TWEEN_S = 0.55;

const LOGGED_OUT_AUTH_STORY =
  "/iframe.html?id=components-loggedoutauthlinks--default&viewMode=story";

const OUT_DIR = path.join(process.cwd(), "local/auth-nav-hover-snapshots");

test.describe("Auth nav hover snapshot export (local only, gitignored)", () => {
  test("writes dense timeline frames for login/register hovers", async ({ page }) => {
    await fs.mkdir(OUT_DIR, { recursive: true });
    const existing = await fs.readdir(OUT_DIR);
    await Promise.all(
      existing.filter((name) => name.endsWith(".png")).map((name) => fs.unlink(path.join(OUT_DIR, name))),
    );

    await page.goto(LOGGED_OUT_AUTH_STORY);
    const pill = page.getByTestId("auth-yin-pill");
    const login = page.getByRole("button", { name: "Login" });

    await pill.waitFor({ state: "visible" });

    const durationMs = HOVER_TWEEN_S * 1000;
    const samplePoints = [0.15, 0.35, 0.5, 0.7, 0.9] as const;
    const settleMs = 80;

    await pill.screenshot({ path: path.join(OUT_DIR, "hover--start-idle.png") });

    await login.hover();
    let elapsed = 0;
    for (const point of samplePoints) {
      const wait = Math.max(0, Math.round(durationMs * point - elapsed));
      await page.waitForTimeout(wait);
      elapsed += wait;
      await pill.screenshot({ path: path.join(OUT_DIR, `hover--login-${Math.round(point * 100)}.png`) });
    }
    await page.waitForTimeout(Math.max(0, Math.round(durationMs + settleMs - elapsed)));
    await pill.screenshot({ path: path.join(OUT_DIR, "hover--login-end.png") });

    // Reset to idle before sampling register hover to avoid cross-hover artifacts.
    const box = await pill.boundingBox();
    if (!box) throw new Error("pill box missing");
    await page.mouse.move(box.x - 12, box.y + box.height / 2);
    await page.waitForTimeout(durationMs + settleMs);
    await pill.screenshot({ path: path.join(OUT_DIR, "hover--idle-reset.png") });

    await page.getByRole("button", { name: "Register" }).hover();
    elapsed = 0;
    for (const point of samplePoints) {
      const wait = Math.max(0, Math.round(durationMs * point - elapsed));
      await page.waitForTimeout(wait);
      elapsed += wait;
      await pill.screenshot({
        path: path.join(OUT_DIR, `hover--register-${Math.round(point * 100)}.png`),
      });
    }
    await page.waitForTimeout(Math.max(0, Math.round(durationMs + settleMs - elapsed)));
    await pill.screenshot({ path: path.join(OUT_DIR, "hover--register-end.png") });
  });
});
