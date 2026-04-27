import { expect, test, type Locator } from "playwright/test";

const LOGGED_OUT_AUTH_STORY =
  "/iframe.html?id=components-loggedoutauthlinks--default&viewMode=story";
const FULL_CHROME_STORY =
  "/iframe.html?id=auth-themeselector--with-header-and-footer&viewMode=story";

const svgRectOpacity = async (locator: Locator) =>
  locator.evaluate((el) => {
    const svg = el as SVGRectElement;
    const o = getComputedStyle(svg).opacity;
    if (o && o !== "") return o;
    const a = svg.getAttribute("opacity");
    return a ?? "";
  });

test.describe("LoggedOutAuthLinks yin-yang pill", () => {
  test("hovering one auth link hides the other until the pointer leaves the pill", async ({ page }) => {
    await page.goto(LOGGED_OUT_AUTH_STORY);

    const pill = page.getByTestId("auth-yin-pill");
    const login = page.getByRole("button", { name: "Login" });
    const register = page.getByRole("button", { name: "Register" });

    await expect(pill).toBeVisible();
    await expect(login).toBeVisible();
    await expect(register).toBeVisible();

    await login.hover();
    await expect.poll(async () => register.evaluate((el) => getComputedStyle(el).opacity), { timeout: 8000 }).toBe("0");
    await expect.poll(async () => login.evaluate((el) => getComputedStyle(el).opacity), { timeout: 8000 }).toBe("1");

    const box = await pill.boundingBox();
    if (!box) throw new Error("pill box missing");
    await page.mouse.move(box.x - 8, box.y + box.height / 2);

    await register.hover();
    await expect.poll(async () => login.evaluate((el) => getComputedStyle(el).opacity), { timeout: 8000 }).toBe("0");
    await expect.poll(async () => register.evaluate((el) => getComputedStyle(el).opacity), { timeout: 8000 }).toBe("1");

    const endBox = await pill.boundingBox();
    if (!endBox) throw new Error("pill box missing");
    await page.mouse.move(endBox.x - 8, endBox.y + endBox.height / 2);
    await expect.poll(async () => login.evaluate((el) => getComputedStyle(el).opacity), { timeout: 8000 }).toBe("1");
    await expect.poll(async () => register.evaluate((el) => getComputedStyle(el).opacity), { timeout: 8000 }).toBe("1");
  });

  test("login hover morphs background to split phase (horizontal seam)", async ({ page }) => {
    await page.goto(LOGGED_OUT_AUTH_STORY);
    const pill = page.getByTestId("auth-yin-pill");
    const login = page.getByRole("button", { name: "Login" });
    const liquids = page.getByTestId("auth-yin-liquids");
    const accentPath = page.getByTestId("auth-yin-liquid-accent");
    const glassPath = page.getByTestId("auth-yin-liquid-glass");

    await expect(liquids).toBeVisible();
    await expect(pill).toHaveAttribute("data-auth-yin-phase", "seam");
    await expect(liquids).toHaveAttribute("data-auth-yin-liquids", "seam");

    await expect.poll(async () => svgRectOpacity(accentPath), { timeout: 4000 }).toBe("1");
    await expect.poll(async () => svgRectOpacity(glassPath), { timeout: 4000 }).toBe("1");

    await login.hover();
    await expect.poll(() => pill.getAttribute("data-auth-yin-phase"), { timeout: 6000 }).toBe("split");
    await expect.poll(() => liquids.getAttribute("data-auth-yin-liquids"), { timeout: 6000 }).toBe("split");
    await expect.poll(async () => accentPath.getAttribute("d"), { timeout: 6000 }).toMatch(/L 0 22/);

    const box = await pill.boundingBox();
    if (!box) throw new Error("pill box missing");
    await page.mouse.move(box.x - 8, box.y + box.height / 2);

    await page.getByRole("button", { name: "Register" }).hover();
    await expect.poll(async () => glassPath.getAttribute("d"), { timeout: 6000 }).toMatch(/L 0 22/);
  });

  test("Login opens auth modal with Sign in tab", async ({ page }) => {
    await page.goto(LOGGED_OUT_AUTH_STORY);
    await page.getByRole("button", { name: "Login" }).click();
    const dialog = page.getByRole("dialog", { name: "Compose requires an account" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("tab", { name: "Sign in" })).toHaveAttribute("aria-selected", "true");
  });

  test("full chrome story: auth pill hides inactive label on hover", async ({ page }) => {
    await page.goto(FULL_CHROME_STORY);

    const pill = page.getByTestId("auth-yin-pill");
    await expect(pill).toBeVisible();

    const login = page.getByRole("button", { name: "Login" });
    const register = page.getByRole("button", { name: "Register" });

    await login.hover();
    await expect.poll(async () => register.evaluate((el) => getComputedStyle(el).opacity), { timeout: 8000 }).toBe("0");

    // Expanded login hit target covers the pill; leave before hovering Register.
    await page.getByLabel("Theme").hover();
    await register.hover();
    await expect.poll(async () => login.evaluate((el) => getComputedStyle(el).opacity), { timeout: 8000 }).toBe("0");
  });
});
