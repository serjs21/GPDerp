import { isValidEmailFormat, normalizeEmail } from "../emailValidation";

describe("normalizeEmail", () => {
  it("trims, lowercases, and strips NUL bytes", () => {
    expect(normalizeEmail("  Test@EXAMPLE.com \0 ")).toBe("test@example.com");
  });
});

describe("isValidEmailFormat", () => {
  it("accepts typical addresses", () => {
    expect(isValidEmailFormat("a@b.co")).toBe(true);
    expect(isValidEmailFormat("user.name+tag@example.com")).toBe(true);
  });

  it("rejects empty, missing @, multiple @, and oversize", () => {
    expect(isValidEmailFormat("")).toBe(false);
    expect(isValidEmailFormat("nope")).toBe(false);
    expect(isValidEmailFormat("a@b@c.com")).toBe(false);
    expect(isValidEmailFormat(`${"a".repeat(250)}@b.co`)).toBe(false);
  });

  it("rejects consecutive dots in local or domain", () => {
    expect(isValidEmailFormat("foo..bar@example.com")).toBe(false);
    expect(isValidEmailFormat("foo@exam..ple.com")).toBe(false);
  });
});
