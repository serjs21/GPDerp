import { hashPassword, normalizeEmail, validatePassword, verifyPassword } from "../utils";

describe("auth utils", () => {
  describe("normalizeEmail", () => {
    it("normalizes email to lowercase and trims whitespace", () => {
      expect(normalizeEmail("  TeSt.User@Example.COM ")).toBe("test.user@example.com");
    });
  });

  describe("validatePassword", () => {
    it("rejects passwords shorter than 8 characters", () => {
      const result = validatePassword("short");
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.message).toBe("Password must be at least 8 characters long");
      }
    });

    it("accepts passwords with at least 8 characters", () => {
      const result = validatePassword("password8");
      expect(result.valid).toBe(true);
    });
  });

  describe("hashPassword + verifyPassword", () => {
    it("hashes a password and verifies it correctly", async () => {
      const password = "my-secure-password";
      const hash = await hashPassword(password);
      expect(hash).not.toBe(password);

      const ok = await verifyPassword(hash, password);
      const bad = await verifyPassword(hash, "wrong-password");
      expect(ok).toBe(true);
      expect(bad).toBe(false);
    });
  });
});
