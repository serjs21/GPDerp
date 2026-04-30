import fs from "node:fs/promises";
import path from "node:path";
import { expect, test } from "playwright/test";

const AUTH_DUALITY_STORY =
  "/iframe.html?id=components-authenticationnav-authdualitytoggle--default&viewMode=story";
const OUT_DIR = path.join(process.cwd(), "local/auth-duality/snapshots-hover-test");

test.describe("Auth duality toggle snapshots for designer review", () => {
  test("exports keyframes for login/register transitions", async ({ page }) => {
    await fs.mkdir(OUT_DIR, { recursive: true });
    const existing = await fs.readdir(OUT_DIR);
    await Promise.all(
      existing.filter((name) => name.endsWith(".png")).map((name) => fs.unlink(path.join(OUT_DIR, name))),
    );

    await page.goto(AUTH_DUALITY_STORY);
    const toggle = page.getByTestId("auth-duality-toggle");
    await expect(toggle).toBeVisible();

    const login = page.getByRole("button", { name: "Login" });
    const register = page.getByRole("button", { name: "Register" });

    await toggle.screenshot({ path: path.join(OUT_DIR, "playwright--idle.png") });

    await login.hover();
    await page.waitForTimeout(140);
    await toggle.screenshot({ path: path.join(OUT_DIR, "playwright--login-mid.png") });
    await page.waitForTimeout(220);
    await toggle.screenshot({ path: path.join(OUT_DIR, "playwright--login-end.png") });

    const box = await toggle.boundingBox();
    if (!box) throw new Error("toggle box missing");
    await page.mouse.move(box.x - 16, box.y + box.height / 2);
    await page.waitForTimeout(360);

    await register.hover();
    await page.waitForTimeout(140);
    await toggle.screenshot({ path: path.join(OUT_DIR, "playwright--register-mid.png") });
    await page.waitForTimeout(220);
    await toggle.screenshot({ path: path.join(OUT_DIR, "playwright--register-end.png") });
  });

  test("keeps outer size stable during hover animation", async ({ page }) => {
    await page.goto(AUTH_DUALITY_STORY);
    const toggle = page.getByTestId("auth-duality-toggle");
    await expect(toggle).toBeVisible();

    const before = await toggle.boundingBox();
    if (!before) throw new Error("missing initial toggle bounds");

    await page.getByRole("button", { name: "Login" }).hover();
    await page.waitForTimeout(120);
    const during = await toggle.boundingBox();
    if (!during) throw new Error("missing during-hover toggle bounds");

    await page.waitForTimeout(260);
    const after = await toggle.boundingBox();
    if (!after) throw new Error("missing end-hover toggle bounds");

    const tolerance = 0.5;
    expect(Math.abs(before.width - during.width)).toBeLessThanOrEqual(tolerance);
    expect(Math.abs(before.height - during.height)).toBeLessThanOrEqual(tolerance);
    expect(Math.abs(before.width - after.width)).toBeLessThanOrEqual(tolerance);
    expect(Math.abs(before.height - after.height)).toBeLessThanOrEqual(tolerance);
  });
});
