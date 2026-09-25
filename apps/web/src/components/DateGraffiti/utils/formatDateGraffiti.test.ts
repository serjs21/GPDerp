import { formatDateGraffiti } from "./formatDateGraffiti";

describe("formatDateGraffiti", () => {
  it("formats dates as zero-padded DD.MM.YY numbers only", () => {
    // Local calendar parts — pin via Date(y, mIndex, d) to avoid UTC shift.
    expect(formatDateGraffiti(new Date(2026, 0, 15))).toBe("15.01.26");
    expect(formatDateGraffiti(new Date(2026, 11, 5))).toBe("05.12.26");
  });

  it("returns empty string for invalid dates", () => {
    expect(formatDateGraffiti("not-a-date")).toBe("");
  });
});
