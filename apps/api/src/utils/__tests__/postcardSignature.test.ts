import {
  POSTCARD_SIGNATURE_FONT_PX,
  POSTCARD_SIGNATURE_INDENT_PX,
  POSTCARD_SIGNATURE_LONG_MAX_FONT_PX,
  POSTCARD_SIGNATURE_MIN_FONT_PX,
} from "../../consts/postcard";
import { postcardSignatureLayout } from "../postcardSignature";

describe("postcardSignatureLayout", () => {
  it("keeps short names indented at full size", () => {
    expect(postcardSignatureLayout(" Aki Tanaka ")).toMatchObject({
      text: "From: Aki Tanaka",
      indentPx: POSTCARD_SIGNATURE_INDENT_PX,
      fontPx: POSTCARD_SIGNATURE_FONT_PX,
    });
  });

  it("moves long names to the corner and shrinks them", () => {
    const layout = postcardSignatureLayout("Akira Tanaka-Nakamura");
    expect(layout.indentPx).toBe(0);
    expect(layout.fontPx).toBeLessThanOrEqual(POSTCARD_SIGNATURE_LONG_MAX_FONT_PX);
    expect(layout.fontPx).toBeGreaterThan(POSTCARD_SIGNATURE_MIN_FONT_PX);
  });

  it("never shrinks below the minimum font size", () => {
    expect(postcardSignatureLayout("x".repeat(80)).fontPx).toBe(POSTCARD_SIGNATURE_MIN_FONT_PX);
  });
});
