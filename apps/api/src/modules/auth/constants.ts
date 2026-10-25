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
  /** Minimum gap between verification emails a signed-in user can request. */
  verificationResendCooldownSeconds: 60,
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
  emailNotVerified: "Verify your email address to continue.",
  verificationResendCooldown: "A verification email was just sent. Try again in a minute.",
} as const;

export const AUTH_CODES = {
  EMAIL_IN_USE: "EMAIL_IN_USE",
  USERNAME_TAKEN: "USERNAME_TAKEN",
  USE_GOOGLE: "USE_GOOGLE",
  TOO_MANY_ATTEMPTS: "TOO_MANY_ATTEMPTS",
  GOOGLE_SIGNUP_REQUIRED: "GOOGLE_SIGNUP_REQUIRED",
  EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
  VERIFICATION_RESEND_COOLDOWN: "VERIFICATION_RESEND_COOLDOWN",
} as const;
