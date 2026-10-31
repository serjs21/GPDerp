import type { ErrorEvent } from "@sentry/react";
import { scrubBrowserEvent } from "./scrubBrowserEvent";
import { parseSampleRate } from "./monitoringConfig";

describe("scrubBrowserEvent", () => {
  it("keeps only the page URL without query/fragment and the user agent", () => {
    const event = scrubBrowserEvent({
      request: {
        url: "https://gpderp.party/verify?token=secret#x",
        query_string: "token=secret",
        cookies: { access_token: "abc" },
        headers: { "User-Agent": "Mozilla/5.0", Referer: "https://elsewhere.example/?q=1", Cookie: "a=b" },
      },
      user: { id: "u1", email: "a@example.com" },
      breadcrumbs: [{ message: "clicked" }],
    } as unknown as ErrorEvent);

    expect(event.request).toEqual({ url: "https://gpderp.party/verify", headers: { "User-Agent": "Mozilla/5.0" } });
    expect(event.user).toBeUndefined();
    expect(event.breadcrumbs).toBeUndefined();
  });
});

describe("parseSampleRate", () => {
  it("accepts 0..1 and falls back otherwise", () => {
    expect(parseSampleRate("0.1", 1)).toBe(0.1);
    expect(parseSampleRate("1.5", 1)).toBe(1);
    expect(parseSampleRate("", 1)).toBe(1);
  });
});
