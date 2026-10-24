import { formatMailFrom } from "../mailFrom";

describe("formatMailFrom", () => {
  it("adds the display name to a bare address", () => {
    expect(formatMailFrom("toaster@gpderp.party", "GPDerp")).toBe('"GPDerp" <toaster@gpderp.party>');
  });

  it("keeps an address that already has a display name", () => {
    expect(formatMailFrom("Toaster <toaster@gpderp.party>", "GPDerp")).toBe("Toaster <toaster@gpderp.party>");
  });

  it("leaves the bare address when the name is empty, and stays empty without an address", () => {
    expect(formatMailFrom("toaster@gpderp.party", "  ")).toBe("toaster@gpderp.party");
    expect(formatMailFrom("", "GPDerp")).toBe("");
  });

  it("strips quotes and line breaks from the name (no header injection)", () => {
    expect(formatMailFrom("toaster@gpderp.party", 'GP"Derp\r\nBcc: x@y.z')).toBe('"GPDerpBcc: x@y.z" <toaster@gpderp.party>');
  });
});
