import type { ShareLinkListItem } from "@/api/shareLinks";
import {
  canStartShareLink,
  getShareLinkStatus,
  isActiveShareLink,
  isExpired,
  isViewLimitReached,
} from "./shareLinkStatus";

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
  ...overrides,
});

describe("shareLinkStatus", () => {
  it("treats disabled links as inactive", () => {
    const link = baseLink({ disabled: true });
    expect(isActiveShareLink(link)).toBe(false);
    expect(getShareLinkStatus(link).kind).toBe("stopped");
  });

  it("treats running links within limits as active", () => {
    const link = baseLink();
    expect(isActiveShareLink(link)).toBe(true);
    expect(getShareLinkStatus(link).kind).toBe("active_indefinite");
  });

  it("allows start only when manually stopped and within limits", () => {
    expect(canStartShareLink(baseLink({ disabled: true }))).toBe(true);
    expect(canStartShareLink(baseLink({ disabled: true, expirationDate: "2020-01-01T00:00:00.000Z" }))).toBe(
      false,
    );
    expect(canStartShareLink(baseLink({ disabled: true, maxViews: 2, viewCount: 2 }))).toBe(false);
  });

  it("detects expired and view-limit states", () => {
    const expired = baseLink({ expirationDate: "2020-01-01T00:00:00.000Z" });
    expect(isExpired(expired)).toBe(true);
    expect(getShareLinkStatus(expired).kind).toBe("expired");

    const limited = baseLink({ maxViews: 3, viewCount: 3 });
    expect(isViewLimitReached(limited)).toBe(true);
    expect(getShareLinkStatus(limited).kind).toBe("view_limit_reached");
  });
});
