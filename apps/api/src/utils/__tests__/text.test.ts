import { cleanText } from "../text";

describe("cleanText", () => {
  it("returns undefined for non-strings", () => {
    expect(cleanText(null)).toBeUndefined();
    expect(cleanText(1)).toBeUndefined();
  });

  it("trims and caps length", () => {
    expect(cleanText("  hi  ", 10)).toBe("hi");
    expect(cleanText("abcdefgh", 3)).toBe("abc");
  });
});
