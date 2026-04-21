import argon2 from "argon2";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { env } from "../../env";

export { normalizeEmail, isValidEmailFormat } from "../../utils/emailValidation";
export {
  USERNAME_MAX,
  USERNAME_MIN,
  normalizeUsername,
  validateUsername,
  type UsernameValidationResult,
} from "../../utils/usernameValidation";

type PasswordRule = {
  name: string;
  check: (password: string) => boolean;
  message: string;
};

const PASSWORD_RULES: PasswordRule[] = [
  {
    name: "minLength",
    check: (password) => password.length >= 8,
    message: "Password must be at least 8 characters long",
  },
];

const DUMMY_HASH =
  "$argon2id$v=19$m=65536,t=3,p=4$9m84Y0E5NzBqTU55ak5jSg$OfH4GgA7f3KvruPc9j5aqHMmlkHjvHyc8k2Rhe/cQhQ";

export type PasswordValidationResult = { valid: true } | { valid: false; message: string };

export const validatePassword = (password: string): PasswordValidationResult => {
  for (const rule of PASSWORD_RULES) {
    if (!rule.check(password)) {
      return { valid: false, message: rule.message };
    }
  }
  return { valid: true };
};

export const hashPassword = async (password: string) =>
  argon2.hash(password, {
    type: argon2.argon2id,
  });

export const verifyPassword = async (hash: string, password: string) => argon2.verify(hash, password);

export const verifyPasswordAgainstDummyHash = async (password: string) =>
  argon2.verify(DUMMY_HASH, password).catch(() => false);

export const generateOpaqueToken = (byteLength = 48) => randomBytes(byteLength).toString("base64url");

export const hashToken = (token: string) =>
  createHash("sha256")
    .update(`${token}.${env.TOKEN_HASH_PEPPER}`)
    .digest("hex");

export const safeEqual = (a: string, b: string) => {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return timingSafeEqual(aBuffer, bBuffer);
};

export const addSeconds = (seconds: number) => new Date(Date.now() + seconds * 1000);
