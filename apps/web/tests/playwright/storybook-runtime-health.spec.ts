import { expect, test } from "playwright/test";

type StoryIndexEntry = {
  id: string;
  type?: "docs" | "story";
  title?: string;
  name?: string;
};

function shouldIgnoreConsoleError(text: string): boolean {
  return (
    text.includes("Failed to load resource: net::ERR_FAILED") ||
    text.includes("has been blocked by CORS policy") ||
    text.includes("Failed to load resource: the server responded with a status of 404")
  );
}

function toIndexEntries(payload: unknown): StoryIndexEntry[] {
  if (!payload || typeof payload !== "object") return [];
  const root = payload as Record<string, unknown>;
  const entriesObj = (root.entries ?? root.stories) as Record<string, unknown> | undefined;
  if (!entriesObj || typeof entriesObj !== "object") return [];

  const entries: StoryIndexEntry[] = [];
  for (const [id, value] of Object.entries(entriesObj)) {
    if (!value || typeof value !== "object") continue;
    const v = value as Record<string, unknown>;
    entries.push({
      id,
      type: v.type === "docs" ? "docs" : "story",
      title: typeof v.title === "string" ? v.title : undefined,
      name: typeof v.name === "string" ? v.name : undefined,
    });
  }
  return entries;
}

test.describe("Storybook runtime health", () => {
  test("all stories mount without runtime or console errors", async ({ page, request }) => {
    test.setTimeout(180_000);

    const indexRes = await request.get("/index.json");
    expect(indexRes.ok()).toBeTruthy();
    const indexJson = (await indexRes.json()) as unknown;
    const entries = toIndexEntries(indexJson);
    expect(entries.length).toBeGreaterThan(0);

    const errors: string[] = [];

    for (const entry of entries) {
      const runtimeErrors: string[] = [];
      const onPageError = (err: Error) => runtimeErrors.push(`pageerror: ${err.message}`);
      const onConsole = (msg: { type(): string; text(): string }) => {
        if (msg.type() !== "error") return;
        const text = msg.text();
        if (shouldIgnoreConsoleError(text)) return;
        runtimeErrors.push(`console.error: ${text}`);
      };

      page.on("pageerror", onPageError);
      page.on("console", onConsole);

      const viewMode = entry.type === "docs" ? "docs" : "story";
      const url = `/iframe.html?id=${entry.id}&viewMode=${viewMode}`;

      await page.goto(url, { waitUntil: "networkidle" });
      await expect
        .poll(
          () =>
            page.evaluate(() => {
              const docs = document.querySelector("#storybook-docs");
              const root = document.querySelector("#storybook-root");
              const docsVisible = !!docs && !docs.hasAttribute("hidden");
              const rootVisible = !!root && !root.hasAttribute("hidden");
              return docsVisible || rootVisible;
            }),
          { timeout: 8_000 },
        )
        .toBeTruthy();
      await page.waitForTimeout(120);

      page.off("pageerror", onPageError);
      page.off("console", onConsole);

      if (runtimeErrors.length > 0) {
        const label = `${entry.id}${entry.title ? ` (${entry.title})` : ""}`;
        errors.push(`${label}\n  ${runtimeErrors.join("\n  ")}`);
      }
    }

    expect(
      errors,
      `Storybook runtime errors detected:\n\n${errors.join("\n\n") || "(none)"}`,
    ).toEqual([]);
  });
});

