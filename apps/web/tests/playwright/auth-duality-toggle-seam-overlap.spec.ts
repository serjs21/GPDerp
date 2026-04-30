import { expect, test } from "playwright/test";

const STORY =
  "/iframe.html?id=components-authenticationnav-authdualitytoggle--default&viewMode=story";

async function collectOverlapFrames(page: Parameters<typeof test>[0]["page"], sampleMs: number) {
  return page.evaluate(async ({ sampleMs: ms }) => {
    const root = document.querySelector('[data-testid="auth-duality-toggle"]') as HTMLElement | null;
    const seam = root?.querySelector(".syl-anime-seam") as SVGPathElement | null;
    if (!root || !seam) return { error: "missing root/seam", overlapFrames: -1, totalFrames: 0 };

    const seamLength = seam.getTotalLength();
    const overlapEvents: Array<{ t: number; className: string; seamX: number; y: number }> = [];
    let totalFrames = 0;

    const seamXAtY = (targetY: number) => {
      let best: { x: number; dy: number } | null = null;
      const steps = 260;
      for (let i = 0; i <= steps; i += 1) {
        const point = seam.getPointAtLength((i / steps) * seamLength);
        const dy = Math.abs(point.y - targetY);
        if (!best || dy < best.dy) best = { x: point.x, dy };
      }
      return best;
    };

    const started = performance.now();
    while (performance.now() - started <= ms) {
      totalFrames += 1;
      const rootRect = root.getBoundingClientRect();
      const glyphs = Array.from(root.querySelectorAll(".syl-anime-label-glyph, .syl-anime-symbol-glyph"));

      for (const glyph of glyphs) {
        const glyphParent = (glyph.parentElement ?? glyph) as HTMLElement;
        const parentOpacity = Number(getComputedStyle(glyphParent).opacity);
        if (parentOpacity < 0.08) continue;

        const box = glyph.getBoundingClientRect();
        const local = {
          left: box.left - rootRect.left,
          right: box.right - rootRect.left,
          top: box.top - rootRect.top,
          bottom: box.bottom - rootRect.top,
        };
        const probeYs = [local.top + 0.5, (local.top + local.bottom) / 2, local.bottom - 0.5];

        for (const y of probeYs) {
          const seamSample = seamXAtY(y);
          if (!seamSample) continue;
          if (seamSample.dy <= 1.2 && seamSample.x >= local.left && seamSample.x <= local.right) {
            overlapEvents.push({
              t: Math.round(performance.now() - started),
              className: glyph.className,
              seamX: Number(seamSample.x.toFixed(2)),
              y: Number(y.toFixed(2)),
            });
            break;
          }
        }
      }
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    }

    return {
      overlapFrames: overlapEvents.length,
      totalFrames,
      firstEvents: overlapEvents.slice(0, 5),
    };
  }, { sampleMs: sampleMs });
}

test.describe("Auth duality toggle seam/text overlap", () => {
  test("never shows visible overlap between S seam and text/icon glyphs", async ({ page }) => {
    await page.goto(STORY);
    const toggle = page.getByTestId("auth-duality-toggle");
    await expect(toggle).toBeVisible();

    const loginButton = page.getByRole("button", { name: "Login" }).first();
    const registerButton = page.getByRole("button", { name: "Register" }).first();

    await loginButton.hover();
    const loginHover = await collectOverlapFrames(page, 1400);

    await registerButton.hover();
    const registerHover = await collectOverlapFrames(page, 1400);

    await page.mouse.move(5, 5);
    const hoverAway = await collectOverlapFrames(page, 1200);

    if ("error" in loginHover || "error" in registerHover || "error" in hoverAway) {
      throw new Error(
        `Overlap sampler setup failed: ${JSON.stringify({ loginHover, registerHover, hoverAway })}`,
      );
    }

    expect(
      loginHover.overlapFrames,
      `login-hover overlap events: ${JSON.stringify(loginHover.firstEvents)}`,
    ).toBe(0);
    expect(
      registerHover.overlapFrames,
      `register-hover overlap events: ${JSON.stringify(registerHover.firstEvents)}`,
    ).toBe(0);
    expect(
      hoverAway.overlapFrames,
      `hover-away overlap events: ${JSON.stringify(hoverAway.firstEvents)}`,
    ).toBe(0);
  });
});
