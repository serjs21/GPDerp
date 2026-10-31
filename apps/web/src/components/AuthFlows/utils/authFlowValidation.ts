/** Same minimum as the API's password policy (`validatePassword`). */
export const PASSWORD_MIN_LENGTH = 8;

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** First failing login check as a `AuthFlows.login` message key; null when valid. */
export function loginFormErrorKey(trimmedEmail: string, password: string): string | null {
  if (!trimmedEmail || !isValidEmail(trimmedEmail)) return "invalidEmail";
  if (!password) return "passwordRequired";
  if (password.length < PASSWORD_MIN_LENGTH) return "passwordTooShort";
  return null;
}

/** First failing registration check as a `AuthFlows.register` message key; null when valid. */
export function registerFormErrorKey(trimmedEmail: string, password: string, confirm: string): string | null {
  if (!trimmedEmail || !isValidEmail(trimmedEmail)) return "invalidEmail";
  if (!password) return "passwordRequired";
  if (password.length < PASSWORD_MIN_LENGTH) return "passwordTooShort";
  if (confirm !== password) return "passwordsDoNotMatch";
  return null;
}
