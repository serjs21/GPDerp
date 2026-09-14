import {
  patchShareLinksCache,
  removeShareLinkFromCache,
  type ShareLinksInfiniteData,
} from "./shareLinksCache";
import type { ShareLinkListItem } from "@/api/shareLinks";

const baseLink = (overrides: Partial<ShareLinkListItem> = {}): ShareLinkListItem => ({
  id: "link-1",
  shareHash: "hash",
  shareUrl: "https://example.com/share/hash",
  haikuSubject: "Mist",
  sharedHaikuId: "haiku-1",
  createdAt: "2026-01-01T00:00:00.000Z",
  expirationDate: null,
  maxViews: 10,
  viewCount: 1,
  disabled: false,
  deactivationReason: null,
  ...overrides,
});

const cacheOf = (items: ShareLinkListItem[], total = items.length): ShareLinksInfiniteData => ({
  pages: [{ items, total, pageSize: 50, offset: 0 }],
  pageParams: [0],
});

describe("patchShareLinksCache", () => {
  it("patches an existing row by id", () => {
    const next = patchShareLinksCache(
      cacheOf([baseLink()]),
      baseLink({ viewCount: 4, disabled: true, deactivationReason: "limit_reached" }),
    );
    expect(next?.pages[0]?.items[0]?.viewCount).toBe(4);
    expect(next?.pages[0]?.items[0]?.disabled).toBe(true);
    expect(next?.pages[0]?.total).toBe(1);
  });

  it("prepends a new row when the id is missing", () => {
    const existing = baseLink({ id: "link-old" });
    const created = baseLink({ id: "link-new", haikuSubject: "New" });
    const next = patchShareLinksCache(cacheOf([existing]), created);
    expect(next?.pages[0]?.items.map((item) => item.id)).toEqual(["link-new", "link-old"]);
    expect(next?.pages[0]?.total).toBe(2);
  });
});

describe("removeShareLinkFromCache", () => {
  it("drops the matching row and decrements total", () => {
    const next = removeShareLinkFromCache(
      cacheOf([baseLink({ id: "a" }), baseLink({ id: "b" })], 2),
      "a",
    );
    expect(next?.pages[0]?.items.map((item) => item.id)).toEqual(["b"]);
    expect(next?.pages[0]?.total).toBe(1);
  });
});
