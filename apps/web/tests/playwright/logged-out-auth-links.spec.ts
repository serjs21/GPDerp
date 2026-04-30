import { expect, test } from "playwright/test";

const LOGGED_OUT_AUTH_STORY =
  "/iframe.html?id=components-loggedoutauthlinks--default&viewMode=story";
const FULL_CHROME_STORY =
  "/iframe.html?id=auth-themeselector--with-header-and-footer&viewMode=story";

test.describe("LoggedOutAuthLinks auth duality toggle", () => {
  test("hovering a side expands it and shrinks the other side", async ({ page }) => {
    await page.goto(LOGGED_OUT_AUTH_STORY);

    const pill = page.getByTestId("auth-duality-toggle");
    const login = page.getByRole("button", { name: "Login" });
    const register = page.getByRole("button", { name: "Register" });

    await expect(pill).toBeVisible();
    await expect(login).toBeVisible();
    await expect(register).toBeVisible();

    const loginInitialBox = await login.boundingBox();
    const registerInitialBox = await register.boundingBox();
    if (!loginInitialBox || !registerInitialBox) throw new Error("initial button bounds missing");

    await login.hover();
    await page.waitForTimeout(300);
    const loginHoverBox = await login.boundingBox();
    const registerHoverBox = await register.boundingBox();
    if (!loginHoverBox || !registerHoverBox) throw new Error("hover button bounds missing");
    expect(loginHoverBox.width).toBeGreaterThan(loginInitialBox.width);
    expect(registerHoverBox.width).toBeLessThan(registerInitialBox.width);

    const pillBox = await pill.boundingBox();
    if (!pillBox) throw new Error("pill box missing");
    await page.mouse.move(pillBox.x - 16, pillBox.y + pillBox.height / 2);
    await register.hover();
    await page.waitForTimeout(300);
    const loginRegisterHoverBox = await login.boundingBox();
    const registerRegisterHoverBox = await register.boundingBox();
    if (!loginRegisterHoverBox || !registerRegisterHoverBox) throw new Error("register hover button bounds missing");
    expect(registerRegisterHoverBox.width).toBeGreaterThan(registerInitialBox.width);
    expect(loginRegisterHoverBox.width).toBeLessThan(loginInitialBox.width);
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

    const pill = page.getByTestId("auth-duality-toggle");
    await expect(pill).toBeVisible();

    const login = page.getByRole("button", { name: "Login" });
    const register = page.getByRole("button", { name: "Register" });

    const loginInitialBox = await login.boundingBox();
    const registerInitialBox = await register.boundingBox();
    if (!loginInitialBox || !registerInitialBox) throw new Error("initial button bounds missing");

    await login.hover();
    await page.waitForTimeout(300);
    const registerAfterLoginHover = await register.boundingBox();
    if (!registerAfterLoginHover) throw new Error("register hover box missing");
    expect(registerAfterLoginHover.width).toBeLessThan(registerInitialBox.width);

    const pillBox = await pill.boundingBox();
    if (!pillBox) throw new Error("pill box missing");
    await page.mouse.move(pillBox.x - 16, pillBox.y + pillBox.height / 2);
    await register.hover();
    await page.waitForTimeout(300);
    const loginAfterRegisterHover = await login.boundingBox();
    if (!loginAfterRegisterHover) throw new Error("login hover box missing");
    expect(loginAfterRegisterHover.width).toBeLessThan(loginInitialBox.width);
  });
});
