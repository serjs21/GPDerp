import { expect, test } from "playwright/test";

test.describe("OrigamiNoteCrane reference pose", () => {
  test("crane story matches reference landmark verification", async ({ page }) => {
    await page.goto("/iframe.html?id=animations-origaminotecrane--crane&viewMode=story", {
      waitUntil: "networkidle",
    });

    const root = page.locator('[role="img"][aria-label*="Origami crane"]');
    await expect(root).toBeVisible({ timeout: 8_000 });

    await expect(root).toHaveAttribute("data-crane-verified", "true");

    const maxError = Number(await root.getAttribute("data-crane-max-error"));
    expect(maxError).toBeLessThanOrEqual(0.065);

    const head = await root.getAttribute("data-crane-head");
    const tail = await root.getAttribute("data-crane-tail");
    const belly = await root.getAttribute("data-crane-belly");
    expect(head).toBeTruthy();
    expect(tail).toBeTruthy();
    expect(belly).toBeTruthy();

    const [headX, headY] = head!.split(",").map(Number);
    const [tailX, tailY] = tail!.split(",").map(Number);
    const [, bellyY] = belly!.split(",").map(Number);

    expect(headX).toBeLessThan(0.25);
    expect(tailX).toBeGreaterThan(0.7);
    expect(headY).toBeLessThan(bellyY);
    expect(tailY).toBeLessThan(bellyY);
  });
});
