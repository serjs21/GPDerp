import { loginFormErrorKey, PASSWORD_MIN_LENGTH, registerFormErrorKey } from "./authFlowValidation";

const SHORT = "a".repeat(PASSWORD_MIN_LENGTH - 1);
const OK = "a".repeat(PASSWORD_MIN_LENGTH);

describe("loginFormErrorKey", () => {
  it("rejects a password shorter than the minimum before any request", () => {
    expect(loginFormErrorKey("user@example.com", SHORT)).toBe("passwordTooShort");
  });

  it("accepts a password of exactly the minimum length", () => {
    expect(loginFormErrorKey("user@example.com", OK)).toBeNull();
  });

  it("reports the email and empty-password problems first", () => {
    expect(loginFormErrorKey("not-an-email", SHORT)).toBe("invalidEmail");
    expect(loginFormErrorKey("user@example.com", "")).toBe("passwordRequired");
  });
});

describe("registerFormErrorKey", () => {
  it("applies the same minimum", () => {
    expect(registerFormErrorKey("user@example.com", SHORT, SHORT)).toBe("passwordTooShort");
    expect(registerFormErrorKey("user@example.com", OK, OK)).toBeNull();
  });
});
