import { USERNAME_MIN, validateUsername } from "../usernameValidation";

describe("validateUsername", () => {
  it(`requires at least ${USERNAME_MIN} characters after normalization`, () => {
    expect(validateUsername("ab").valid).toBe(false);
    expect(validateUsername("abc").valid).toBe(true);
  });

  it("normalizes to lowercase, underscores, max length", () => {
    const r = validateUsername("  Hello_World_12  ");
    expect(r).toEqual({ valid: true, normalized: "hello_world_12" });
  });

  it("rejects invalid characters after normalization", () => {
    const r = validateUsername("!!!");
    expect(r.valid).toBe(false);
  });
});
