import { chunkRows, nextListOrder } from "./labelPickerUtils";

const label = (id: string, name: string) => ({ id, name, color: "#fff", shape: "classic" });

describe("nextListOrder", () => {
  const labelById = new Map([
    ["a", label("a", "Apple")],
    ["b", label("b", "Banana")],
    ["c", label("c", "Cherry")],
  ]);
  const pagedLabels = [label("a", "Apple"), label("b", "Banana"), label("c", "Cherry")];

  it("puts lead ids first on rebuild, then catalog order", () => {
    expect(
      nextListOrder([], { rebuild: true, leadIds: ["c"], labelById, pagedLabels, query: "" }),
    ).toEqual(["c", "a", "b"]);
  });

  it("returns the previous array when nothing changed", () => {
    const prev = ["c", "a", "b"];
    expect(nextListOrder(prev, { rebuild: false, leadIds: ["a"], labelById, pagedLabels, query: "" })).toBe(
      prev,
    );
  });

  it("appends newly paged labels without reshuffling", () => {
    const prev = ["c", "a"];
    expect(nextListOrder(prev, { rebuild: false, leadIds: [], labelById, pagedLabels, query: "" })).toEqual([
      "c",
      "a",
      "b",
    ]);
  });

  it("filters by query on rebuild", () => {
    expect(
      nextListOrder(["a", "b"], { rebuild: true, leadIds: ["b"], labelById, pagedLabels, query: "an" }),
    ).toEqual(["b"]);
  });
});

describe("chunkRows", () => {
  it("splits into fixed-size rows", () => {
    expect(chunkRows([1, 2, 3, 4], 3)).toEqual([[1, 2, 3], [4]]);
    expect(chunkRows([], 3)).toEqual([]);
  });
});
