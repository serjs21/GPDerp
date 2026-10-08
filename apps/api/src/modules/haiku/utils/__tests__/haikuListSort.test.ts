import {
  DEFAULT_HAIKU_LIST_SORT,
  haikuListOrderBy,
  parseHaikuListSort,
} from "../haikuListSort";

describe("parseHaikuListSort", () => {
  it("defaults to newest first when nothing is given", () => {
    expect(parseHaikuListSort({})).toEqual({ ok: true, value: DEFAULT_HAIKU_LIST_SORT });
    expect(parseHaikuListSort({ sort: " ", order: "" })).toEqual({
      ok: true,
      value: DEFAULT_HAIKU_LIST_SORT,
    });
  });

  it("reads sort and order", () => {
    expect(parseHaikuListSort({ sort: "title", order: "desc" })).toEqual({
      ok: true,
      value: { field: "title", order: "desc" },
    });
    expect(parseHaikuListSort({ sort: "createdAt" })).toEqual({
      ok: true,
      value: { field: "createdAt", order: "asc" },
    });
    expect(parseHaikuListSort({ order: "asc" })).toEqual({
      ok: true,
      value: { field: "createdAt", order: "asc" },
    });
  });

  it("rejects unknown values", () => {
    expect(parseHaikuListSort({ sort: "body" })).toEqual({ ok: false, error: "Invalid sort" });
    expect(parseHaikuListSort({ sort: "title", order: "up" })).toEqual({
      ok: false,
      error: "Invalid order",
    });
  });
});

describe("haikuListOrderBy", () => {
  it("orders by creation date with an id tie-breaker", () => {
    expect(haikuListOrderBy({ field: "createdAt", order: "desc" })).toEqual([
      { createdAt: "desc" },
      { id: "desc" },
    ]);
  });

  it("orders by title, then suffix, creation date and id", () => {
    expect(haikuListOrderBy({ field: "title", order: "asc" })).toEqual([
      { title: "asc" },
      { titleSuffix: "asc" },
      { createdAt: "asc" },
      { id: "asc" },
    ]);
  });
});
