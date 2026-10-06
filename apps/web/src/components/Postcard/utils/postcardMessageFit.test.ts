import {
  POSTCARD_MESSAGE_MAX_CHARS,
  POSTCARD_MESSAGE_MAX_LINES,
} from "../consts/postcardMessageConsts";
import {
  clampPostcardMessage,
  postcardRecipientLines,
  resolvePostcardSenderName,
} from "./postcardMessageFit";

describe("clampPostcardMessage", () => {
  it("keeps short messages unchanged", () => {
    expect(clampPostcardMessage("Hello\nthere")).toBe("Hello\nthere");
  });

  it("caps the character count", () => {
    const result = clampPostcardMessage("a".repeat(POSTCARD_MESSAGE_MAX_CHARS + 50));
    expect(result).toHaveLength(POSTCARD_MESSAGE_MAX_CHARS);
  });

  it("counts emoji as single characters", () => {
    const result = clampPostcardMessage("🌸".repeat(POSTCARD_MESSAGE_MAX_CHARS + 5));
    expect(Array.from(result)).toHaveLength(POSTCARD_MESSAGE_MAX_CHARS);
  });

  it("caps hard line breaks and normalizes CRLF", () => {
    const input = Array.from({ length: POSTCARD_MESSAGE_MAX_LINES + 3 }, (_, i) => `l${i}`).join(
      "\r\n",
    );
    const result = clampPostcardMessage(input);
    expect(result.split("\n")).toHaveLength(POSTCARD_MESSAGE_MAX_LINES);
    expect(result).not.toContain("\r");
  });
});

describe("postcardRecipientLines", () => {
  it("returns trimmed recipients when they fit", () => {
    expect(postcardRecipientLines([" a@x.com ", "", "b@x.com"], 3)).toEqual(["a@x.com", "b@x.com"]);
  });

  it("collapses overflow into a +N more line", () => {
    expect(postcardRecipientLines(["a", "b", "c", "d", "e"], 3)).toEqual(["a", "b", "+3 more"]);
  });
});

describe("resolvePostcardSenderName", () => {
  it("prefers userName, then full name, then email prefix", () => {
    expect(resolvePostcardSenderName({ userName: "aki", firstName: "A" })).toBe("aki");
    expect(resolvePostcardSenderName({ firstName: "Aki", lastName: "Mori" })).toBe("Aki Mori");
    expect(resolvePostcardSenderName({ email: "aki@x.com" })).toBe("aki");
    expect(resolvePostcardSenderName({})).toBe("Someone");
  });
});
