import {
  shareLinkMatchesFilters,
  type ShareLinkListItem,
} from "@/api/shareLinks";

const baseLink = (overrides: Partial<ShareLinkListItem> = {}): ShareLinkListItem => ({
  id: "11111111-1111-4111-8111-111111111111",
  shareHash: "hash",
  shareUrl: "https://example.com/share/hash",
  haikuSubject: "Test haiku",
  createdAt: "2026-01-01T00:00:00.000Z",
  expirationDate: null,
  maxViews: null,
  viewCount: 0,
  disabled: false,
  deactivationReason: null,
  ...overrides,
});

const NOW = Date.parse("2026-06-01T00:00:00.000Z");

describe("shareLinkMatchesFilters", () => {
  it("matches all when every filter is selected", () => {
    expect(
      shareLinkMatchesFilters(baseLink({ disabled: true, deactivationReason: "manual" }), [
        "active",
        "inactive",
        "expired",
        "view_limit_reached",
      ], NOW),
    ).toBe(true);
  });

  it("treats manual-stop as inactive only", () => {
    const link = baseLink({ disabled: true, deactivationReason: "manual" });
    expect(shareLinkMatchesFilters(link, ["inactive"], NOW)).toBe(true);
    expect(shareLinkMatchesFilters(link, ["active"], NOW)).toBe(false);
    expect(shareLinkMatchesFilters(link, ["expired"], NOW)).toBe(false);
  });

  it("routes timeout and limit reasons to their filters", () => {
    const expired = baseLink({ disabled: true, deactivationReason: "timeout" });
    const limited = baseLink({ disabled: true, deactivationReason: "limit_reached" });
    expect(shareLinkMatchesFilters(expired, ["expired"], NOW)).toBe(true);
    expect(shareLinkMatchesFilters(expired, ["inactive"], NOW)).toBe(false);
    expect(shareLinkMatchesFilters(limited, ["view_limit_reached"], NOW)).toBe(true);
    expect(shareLinkMatchesFilters(limited, ["inactive"], NOW)).toBe(false);
  });
});
