import type { HaikuDto } from "@/api/haikus";
import { compareHaikusBySort, orderSortToHaikuListSort } from "./haikuListSortUtils";

const haiku = (id: string, title: string, createdAt: string, titleSuffix = 0): HaikuDto => ({
  id,
  title,
  titleSuffix,
  body: "",
  createdAt,
  accountId: "account-1",
  createdById: "user-1",
  labels: [],
});

describe("orderSortToHaikuListSort", () => {
  it("keeps the API default for no selection and newest first", () => {
    expect(orderSortToHaikuListSort({ categoryId: null, direction: "asc" })).toBeUndefined();
    expect(orderSortToHaikuListSort({ categoryId: "creationDate", direction: "desc" })).toBeUndefined();
    expect(orderSortToHaikuListSort({ categoryId: "unknown", direction: "asc" })).toBeUndefined();
  });

  it("maps creation date and alpacabet", () => {
    expect(orderSortToHaikuListSort({ categoryId: "creationDate", direction: "asc" })).toEqual({
      field: "createdAt",
      order: "asc",
    });
    expect(orderSortToHaikuListSort({ categoryId: "alpacabet", direction: "desc" })).toEqual({
      field: "title",
      order: "desc",
    });
  });
});

describe("compareHaikusBySort", () => {
  const older = haiku("a", "beta", "2026-01-01T00:00:00.000Z");
  const newer = haiku("b", "Alpha", "2026-02-01T00:00:00.000Z");
  const newerCopy = haiku("c", "alpha", "2026-03-01T00:00:00.000Z", 1);

  it("defaults to newest first", () => {
    expect([older, newer].sort((x, y) => compareHaikusBySort(x, y))).toEqual([newer, older]);
  });

  it("sorts titles case-insensitively, then by suffix", () => {
    const sort = { field: "title", order: "asc" } as const;
    expect([older, newerCopy, newer].sort((x, y) => compareHaikusBySort(x, y, sort))).toEqual([
      newer,
      newerCopy,
      older,
    ]);
  });
});
