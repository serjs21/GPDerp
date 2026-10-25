import { resolveUserDisplayName } from "./userDisplayName";

describe("resolveUserDisplayName", () => {
  const base = { userName: null, firstName: "", lastName: "", email: "ada@example.com" };

  it("uses the nickname when set", () => {
    expect(resolveUserDisplayName({ ...base, userName: "ada_l", firstName: "Ada", lastName: "Lovelace" }, "User")).toBe(
      "ada_l",
    );
  });

  it("falls back to first + last name", () => {
    expect(resolveUserDisplayName({ ...base, firstName: " Ada ", lastName: "Lovelace" }, "User")).toBe("Ada Lovelace");
    expect(resolveUserDisplayName({ ...base, userName: "  ", lastName: "Lovelace" }, "User")).toBe("Lovelace");
  });

  it("then the email, then the fallback", () => {
    expect(resolveUserDisplayName(base, "User")).toBe("ada@example.com");
    expect(resolveUserDisplayName({ ...base, email: "" }, "User")).toBe("User");
  });
});
