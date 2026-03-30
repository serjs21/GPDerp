import { validatePassword } from "./utils";

describe("validatePassword", () => {
  it("rejects passwords shorter than 8 chars", () => {
    const result = validatePassword("short");
    expect(result.valid).toBe(false);
  });

  it("accepts passwords with minimum length", () => {
    const result = validatePassword("password8");
    expect(result.valid).toBe(true);
  });
});
