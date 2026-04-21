import { stripDangerousControlChars } from "./sqlSafeInput";

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 32;

export const normalizeUsername = (raw: string) => {
  const s = stripDangerousControlChars(raw)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  return s.slice(0, USERNAME_MAX);
};

export type UsernameValidationResult =
  | { valid: true; normalized: string }
  | { valid: false; message: string };

export const validateUsername = (raw: string): UsernameValidationResult => {
  const normalized = normalizeUsername(raw);
  if (normalized.length < USERNAME_MIN) {
    return { valid: false, message: `Username must be at least ${USERNAME_MIN} characters` };
  }
  if (normalized.length > USERNAME_MAX) {
    return { valid: false, message: `Username must be at most ${USERNAME_MAX} characters` };
  }
  if (!/^[a-z0-9_]+$/.test(normalized)) {
    return {
      valid: false,
      message: "Username may only contain lowercase letters, numbers, and underscores",
    };
  }
  return { valid: true, normalized };
};
