export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** First failing login check as a `AuthFlows.login` message key; null when valid. */
export function loginFormErrorKey(trimmedEmail: string, password: string): string | null {
  if (!trimmedEmail || !isValidEmail(trimmedEmail)) return "invalidEmail";
  if (!password) return "passwordRequired";
  return null;
}

/** First failing registration check as a `AuthFlows.register` message key; null when valid. */
export function registerFormErrorKey(trimmedEmail: string, password: string, confirm: string): string | null {
  if (!trimmedEmail || !isValidEmail(trimmedEmail)) return "invalidEmail";
  if (!password) return "passwordRequired";
  if (password.length < 8) return "passwordTooShort";
  if (confirm !== password) return "passwordsDoNotMatch";
  return null;
}
