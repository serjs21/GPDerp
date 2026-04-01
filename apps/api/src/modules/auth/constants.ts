export const AUTH_COOKIE_NAMES = {
  accessToken: "access_token",
  refreshToken: "refresh_token",
  csrfToken: "csrf_token",
} as const;

export const AUTH_HEADER_NAMES = {
  csrf: "x-csrf-token",
} as const;

export const AUTH_TTL = {
  verificationTokenSeconds: 60 * 60 * 24,
  resetTokenSeconds: 60 * 60 * 24,
} as const;

export const AUTH_MESSAGES = {
  invalidCredentials: "Invalid email or password",
  unauthorized: "Unauthorized",
  invalidAuthRequest: "Invalid authentication request",
  invalidToken: "Invalid or expired token",
  emailAlreadyRegistered: "An account with this email already exists",
  useGoogleSignIn: "This account uses Google sign-in. Please continue with Google.",
  tooManyLoginAttempts: "Too many failed attempts. Try again in an hour.",
  usernameTaken: "This username is already taken",
  googleSignupRequired: "Google account is not registered yet. Complete sign-up to continue.",
} as const;

export const AUTH_CODES = {
  EMAIL_IN_USE: "EMAIL_IN_USE",
  USERNAME_TAKEN: "USERNAME_TAKEN",
  USE_GOOGLE: "USE_GOOGLE",
  TOO_MANY_ATTEMPTS: "TOO_MANY_ATTEMPTS",
  GOOGLE_SIGNUP_REQUIRED: "GOOGLE_SIGNUP_REQUIRED",
} as const;
