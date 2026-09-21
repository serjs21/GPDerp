import { isFineLabelText } from "./isFineLabelText";

describe("isFineLabelText", () => {
  it.each([
    "fine",
    "FINE!",
    "  Fine  ",
    "bien",
    "tudo bem",
    "tout va bien",
    "大丈夫",
    "괜찮아",
    "хорошо",
    "ok",
  ])("detects %s", (value) => {
    expect(isFineLabelText(value)).toBe(true);
  });

  it.each(["refine", "define", "biennial", "hello", "", "   "])(
    "rejects %s",
    (value) => {
      expect(isFineLabelText(value)).toBe(false);
    },
  );

  it("matches fine as a whole word inside a phrase", () => {
    expect(isFineLabelText("it's fine")).toBe(true);
  });
});
