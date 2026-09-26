import {
  isShareLinkActive,
  sortShareLinkRows,
  type ShareLinkSortableRow,
} from "../shareLinkSort";

const now = new Date("2026-06-15T12:00:00.000Z");

function row(
  partial: Partial<ShareLinkSortableRow> & Pick<ShareLinkSortableRow, "id">,
): ShareLinkSortableRow {
  return {
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    expirationDate: null,
    maxViews: null,
    viewCount: 0,
    disabled: false,
    haikuSubject: partial.id,
    ...partial,
  };
}

describe("sortShareLinkRows", () => {
  describe("timeLeft", () => {
    it("orders active infinite, active finite, inactive infinite, inactive expired", () => {
      const activeInfinite = row({ id: "ai", expirationDate: null, disabled: false });
      const activeSoon = row({
        id: "as",
        expirationDate: new Date("2026-06-16T00:00:00.000Z"),
        disabled: false,
      });
      const activeLater = row({
        id: "al",
        expirationDate: new Date("2026-07-01T00:00:00.000Z"),
        disabled: false,
      });
      const inactiveInfinite = row({
        id: "ii",
        expirationDate: null,
        disabled: true,
      });
      const inactiveExpired = row({
        id: "ie",
        expirationDate: new Date("2026-01-01T00:00:00.000Z"),
        disabled: true,
      });

      const sorted = sortShareLinkRows(
        [inactiveExpired, activeLater, inactiveInfinite, activeSoon, activeInfinite],
        { categoryId: "timeLeft", direction: "asc" },
        now,
      );

      expect(sorted.map((r) => r.id)).toEqual(["ai", "as", "al", "ii", "ie"]);
    });

    it("reverses the full asc order when direction is desc", () => {
      const activeInfinite = row({ id: "ai", expirationDate: null });
      const activeSoon = row({
        id: "as",
        expirationDate: new Date("2026-06-16T00:00:00.000Z"),
      });
      const activeLater = row({
        id: "al",
        expirationDate: new Date("2026-07-01T00:00:00.000Z"),
      });
      const inactiveExpired = row({
        id: "ie",
        expirationDate: new Date("2026-01-01T00:00:00.000Z"),
        disabled: true,
      });

      const sorted = sortShareLinkRows(
        [activeSoon, inactiveExpired, activeLater, activeInfinite],
        { categoryId: "timeLeft", direction: "desc" },
        now,
      );

      // Asc would be ai, as, al, ie — desc reverses the whole list.
      expect(sorted.map((r) => r.id)).toEqual(["ie", "al", "as", "ai"]);
    });
  });

  describe("hitsLeft", () => {
    it("orders active infinite, active finite, inactive infinite, inactive at 0", () => {
      const activeInfinite = row({ id: "ai", maxViews: null, disabled: false });
      const activeLow = row({
        id: "alow",
        maxViews: 10,
        viewCount: 8,
        disabled: false,
      });
      const activeHigh = row({
        id: "ahi",
        maxViews: 10,
        viewCount: 1,
        disabled: false,
      });
      const inactiveInfinite = row({
        id: "ii",
        maxViews: null,
        disabled: true,
      });
      const inactiveFinite = row({
        id: "if",
        maxViews: 10,
        viewCount: 3,
        disabled: true,
      });
      const inactiveZero = row({
        id: "iz",
        maxViews: 5,
        viewCount: 5,
        disabled: true,
      });

      const sorted = sortShareLinkRows(
        [
          inactiveZero,
          activeHigh,
          inactiveFinite,
          inactiveInfinite,
          activeLow,
          activeInfinite,
        ],
        { categoryId: "hitsLeft", direction: "asc" },
        now,
      );

      // inactive finite (still has hits) stays with inactive-infinite tier, after true infinite
      expect(sorted.map((r) => r.id)).toEqual([
        "ai",
        "alow",
        "ahi",
        "ii",
        "if",
        "iz",
      ]);
    });
  });

  describe("isShareLinkActive", () => {
    it("treats expired and limit-reached as inactive even when disabled=false", () => {
      expect(
        isShareLinkActive(
          row({
            id: "e",
            expirationDate: new Date("2020-01-01T00:00:00.000Z"),
            disabled: false,
          }),
          now,
        ),
      ).toBe(false);
      expect(
        isShareLinkActive(
          row({ id: "l", maxViews: 3, viewCount: 3, disabled: false }),
          now,
        ),
      ).toBe(false);
    });
  });
});
