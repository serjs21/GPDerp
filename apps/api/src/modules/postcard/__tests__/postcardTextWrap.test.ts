import { POSTCARD_MESSAGE_BOX_WIDTH_PX, POSTCARD_MESSAGE_MAX_LINES } from "../../../consts/postcard";
import { measurePostcardText, postcardMessageFits, wrapPostcardMessage } from "../postcardTextWrap";

const AT_LIMIT =
  "I saw this card and had to buy it for you! Remember our trip to Kyoto? I am having fun but miss you lots. Wish you were here, I miss your jokes and our late night ramen walks by the river. See you soon!".slice(
    0,
    200,
  );

describe("wrapPostcardMessage", () => {
  it("returns no lines for an empty message", () => {
    expect(wrapPostcardMessage("")).toEqual([]);
  });

  it("keeps short lines and hard line breaks", () => {
    expect(wrapPostcardMessage("Hello\n\nthere\r\nfriend")).toEqual(["Hello", "", "there", "friend"]);
  });

  it("wraps at spaces so every line fits the message box", () => {
    const lines = wrapPostcardMessage(AT_LIMIT);

    expect(lines.length).toBeGreaterThan(1);
    expect(lines.join(" ").replace(/\s+/g, " ")).toBe(AT_LIMIT.replace(/\s+/g, " "));
    for (const line of lines) {
      expect(measurePostcardText(line)).toBeLessThanOrEqual(POSTCARD_MESSAGE_BOX_WIDTH_PX);
    }
  });

  it("splits a word only when it cannot fit on a line of its own", () => {
    const longWord = "W".repeat(60);
    const lines = wrapPostcardMessage(`hi ${longWord}`);

    expect(lines[0]).toBe("hi");
    expect(lines.slice(1).join("")).toBe(longWord);
    for (const line of lines) {
      expect(measurePostcardText(line)).toBeLessThanOrEqual(POSTCARD_MESSAGE_BOX_WIDTH_PX);
    }
  });

  it("falls back to the CJK font for characters the hand font lacks", () => {
    expect(measurePostcardText("古池や")).toBeGreaterThan(0);
  });
});

describe("postcardMessageFits", () => {
  it("accepts the at-limit sample (same text as the web story)", () => {
    expect(wrapPostcardMessage(AT_LIMIT).length).toBeLessThanOrEqual(POSTCARD_MESSAGE_MAX_LINES);
    expect(postcardMessageFits(AT_LIMIT)).toBe(true);
  });

  it("rejects more hard lines than the card holds", () => {
    expect(postcardMessageFits(Array.from({ length: POSTCARD_MESSAGE_MAX_LINES + 1 }, () => "a").join("\n"))).toBe(
      false,
    );
  });

  it("rejects wide text that wraps past the line limit", () => {
    expect(postcardMessageFits("WMWMWMWM wmwmwmwm ".repeat(12).slice(0, 200))).toBe(false);
  });
});
