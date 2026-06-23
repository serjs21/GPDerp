import { expect, test, type Locator } from "playwright/test";

const STORY_URL = "/iframe.html?id=auth-themeselector--dark&viewMode=story";
const getComputedColor = async (locator: Locator) =>
  locator.evaluate((el: Element) => getComputedStyle(el).color);

test.describe("ThemeSelector dropdown behavior", () => {
  test("story renders sky background and mountain triangle layers", async ({ page }) => {
    await page.goto(STORY_URL);

    const stage = page.locator("[class*='stage']");
    const triangleBack = page.locator("[class*='triangleBack']");
    const triangleMid = page.locator("[class*='triangleMid']");
    const triangleFront = page.locator("[class*='triangleFront']");

    await expect(stage).toBeVisible();
    await expect(triangleBack).toBeVisible();
    await expect(triangleMid).toBeVisible();
    await expect(triangleFront).toBeVisible();

    const stageBackground = await stage.evaluate((el) => getComputedStyle(el).backgroundImage);
    const backClipPath = await triangleBack.evaluate((el) => getComputedStyle(el).clipPath);

    expect(stageBackground).toContain("gradient");
    // expect(stageBackground).toContain("background.webp");
    expect(backClipPath).toContain("polygon");
  });

  test("preset buttons keep dropdown open and set expected values", async ({ page }) => {
    await page.goto(STORY_URL);

    await page.getByLabel("Theme").click();

    const moonButton = page.getByRole("button", { name: "Set dark theme" });
    const mountainButton = page.getByRole("button", { name: "Set balanced theme" });
    const sunButton = page.getByRole("button", { name: "Set bright theme" });

    await expect(moonButton).toBeVisible();
    await moonButton.click();
    await expect(moonButton).toBeVisible(); // dropdown remains open
    await expect(page.locator(".ant-slider-handle")).toHaveAttribute("aria-valuenow", "0");

    await mountainButton.click();
    await expect(mountainButton).toBeVisible();
    await expect(page.locator(".ant-slider-handle")).toHaveAttribute("aria-valuenow", "50");

    await sunButton.click();
    await expect(sunButton).toBeVisible();
    await expect(page.locator(".ant-slider-handle")).toHaveAttribute("aria-valuenow", "100");
  });

  test("preset icon hover colors follow proximity and button state", async ({ page }) => {
    await page.goto(STORY_URL);
    await page.getByLabel("Theme").click();

    const moonButton = page.getByRole("button", { name: "Set dark theme" });
    const mountainButton = page.getByRole("button", { name: "Set balanced theme" });
    const sunButton = page.getByRole("button", { name: "Set bright theme" });
    const moonIcon = page.getByRole("button", { name: "Set dark theme" }).locator("svg");
    const mountainIcon = page.getByRole("button", { name: "Set balanced theme" }).locator("svg");
    const sunIcon = page.getByRole("button", { name: "Set bright theme" }).locator("svg");

    await moonButton.click();
    await moonIcon.hover();
    const moonIconColor = await getComputedColor(moonIcon);

    await mountainButton.click();
    await mountainIcon.hover();
    const mountainIconColor = await getComputedColor(mountainIcon);

    await sunButton.click();
    await sunIcon.hover();
    const sunIconColor = await getComputedColor(sunIcon);

    expect(moonIconColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(moonIconColor).not.toBe(mountainIconColor);
    expect(mountainIconColor).not.toBe(sunIconColor);
    expect(sunIconColor).not.toBe(moonIconColor);
  });

  test("hover does not move or resize dropdown icons", async ({ page }) => {
    await page.goto(STORY_URL);
    await page.getByLabel("Theme").click();
    await page.waitForTimeout(300);

    const moonButton = page.getByRole("button", { name: "Set dark theme" });
    const before = await moonButton.boundingBox();
    if (!before) throw new Error("Moon button bounding box missing before hover");

    await moonButton.hover();

    const after = await moonButton.boundingBox();
    if (!after) throw new Error("Moon button bounding box missing after hover");

    expect(Math.abs(before.x - after.x)).toBeLessThan(0.5);
    expect(Math.abs(before.y - after.y)).toBeLessThan(0.5);
    expect(Math.abs(before.width - after.width)).toBeLessThan(0.5);
    expect(Math.abs(before.height - after.height)).toBeLessThan(0.5);
  });

  test("hover does not move or resize trigger button", async ({ page }) => {
    await page.goto(STORY_URL);
    const trigger = page.getByLabel("Theme");
    const before = await trigger.boundingBox();
    if (!before) throw new Error("Trigger bounding box missing before hover");

    await trigger.hover();

    const after = await trigger.boundingBox();
    if (!after) throw new Error("Trigger bounding box missing after hover");

    expect(Math.abs(before.x - after.x)).toBeLessThan(0.5);
    expect(Math.abs(before.y - after.y)).toBeLessThan(0.5);
    expect(Math.abs(before.width - after.width)).toBeLessThan(0.5);
    expect(Math.abs(before.height - after.height)).toBeLessThan(0.5);
  });
});
