import { formatDateGraffiti } from "./formatDateGraffiti";

describe("formatDateGraffiti", () => {
  it("formats ISO dates as graffiti day MON 'YY", () => {
    expect(formatDateGraffiti("2026-01-15T10:00:00.000Z")).toMatch(
      /^\d{1,2} [A-Z]{3} '\d{2}$/,
    );
  });

  it("returns empty string for invalid dates", () => {
    expect(formatDateGraffiti("not-a-date")).toBe("");
  });
});
