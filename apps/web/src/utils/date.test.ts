import { formatMfgDate } from "./date";

describe("formatMfgDate", () => {
  it("formats as MFG DD MON YYYY", () => {
    expect(formatMfgDate(new Date(2024, 4, 1))).toBe("MFG 01 MAY 2024");
    expect(formatMfgDate(new Date(2026, 11, 28))).toBe("MFG 28 DEC 2026");
  });

  it("accepts ISO strings", () => {
    expect(formatMfgDate(new Date(2025, 0, 9).toISOString())).toBe("MFG 09 JAN 2025");
  });

  it("returns empty string for invalid dates", () => {
    expect(formatMfgDate("not a date")).toBe("");
  });
});
