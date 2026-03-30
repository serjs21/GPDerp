import type { FastifyInstance, FastifyRequest } from "fastify";
import type { FastifyBaseLogger } from "fastify/types/logger";
import { AuthProvider, EmailActionType } from "../../generated/prisma";
import { AUTH_CODES, AUTH_MESSAGES, AUTH_TTL } from "./constants";
import { authRepository } from "./repository";
import { googleService, type GoogleIdentity } from "./googleService";
import { buildPasswordResetEmail, buildVerificationEmail } from "../email/templates/authTemplates";
import { mailService } from "../email/mailService";
import { tokenService } from "./tokenService";
import {
  addSeconds,
  hashPassword,
  hashToken,
  normalizeEmail,
  normalizeUsername,
  validatePassword,
  validateUsername,
  verifyPassword,
  verifyPasswordAgainstDummyHash,
} from "./utils";
import { AuthError } from "./errors";

type SessionMeta = {
  ip?: string;
  userAgent?: string;
};

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
};

const unauthorizedError = () =>
  new AuthError(AUTH_MESSAGES.unauthorized, { statusCode: 401 });

/** Server-side context for failed auth flows (never log passwords or raw tokens). */
const logAuthFailure = (
  log: FastifyBaseLogger,
  message: string,
  detail: Record<string, unknown> = {},
) => {
  log.warn({ authFailure: true, ...detail }, message);
};

const readSessionMeta = (request: FastifyRequest): SessionMeta => ({
  ip: request.ip,
  userAgent: request.headers["user-agent"],
});

const issueSessionTokens = async (
  userId: string,
  sessionMeta: SessionMeta,
): Promise<AuthTokens> => {
  const session = await authRepository.createSession({
    userId,
    ...sessionMeta,
    expiresAt: tokenService.sessionExpiresAt(),
  });
  const refreshToken = tokenService.createRefreshToken();
  await authRepository.createRefreshToken({
    sessionId: session.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: tokenService.refreshExpiresAt(),
  });
  const csrfToken = tokenService.createCsrfToken();
  const accessToken = await tokenService.createAccessToken({
    sub: userId,
    sid: session.id,
  });
  return { accessToken, refreshToken, csrfToken };
};

const createAndSendVerificationEmail = async (
  log: FastifyBaseLogger,
  email: string,
  userId: string,
) => {
  await authRepository.invalidateEmailActionTokens({
    userId,
    type: EmailActionType.EMAIL_VERIFICATION,
  });

  const rawToken = tokenService.createRefreshToken();
  await authRepository.createEmailActionToken({
    userId,
    type: EmailActionType.EMAIL_VERIFICATION,
    tokenHash: hashToken(rawToken),
    expiresAt: addSeconds(AUTH_TTL.verificationTokenSeconds),
  });
  const message = buildVerificationEmail(rawToken);
  try {
    await mailService.sendEmail({
      to: email,
      ...message,
    });
  } catch (err) {
    log.error(
      { err, authFailure: true, step: "verification_email_send", userId },
      "auth: failed to send verification email",
    );
    throw err;
  }
};

const isUniqueConstraintError = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: string }).code === "P2002";

const LOGIN_FAILURE_WINDOW_MS = 60 * 60 * 1000;
const MAX_FAILED_LOGINS_PER_WINDOW = 5;

const hasGoogleIdentity = (user: { authIdentities: { provider: AuthProvider }[] }) =>
  user.authIdentities.some((i) => i.provider === AuthProvider.GOOGLE);

const allocateUsernameFromEmail = async (
  log: FastifyBaseLogger,
  email: string,
): Promise<string> => {
  const localPart = email.split("@")[0] ?? "user";
  const base = normalizeUsername(localPart.replace(/\./g, "_")) || "user";
  for (let i = 0; i < 100; i++) {
    const suffix = i === 0 ? "" : `_${i}`;
    const maxBase = 32 - suffix.length;
    const candidate = (base.slice(0, Math.max(1, maxBase)) + suffix).toLowerCase();
    const taken = await authRepository.findUserByUserName(candidate);
    if (!taken) return candidate;
  }
  logAuthFailure(log, "auth: could not allocate unique username from email", {
    reason: "username_candidates_exhausted",
  });
  throw new AuthError(AUTH_MESSAGES.invalidAuthRequest, { statusCode: 400 });
};

export const authService = {
  async checkEmailForPasswordRegistration(email: string) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      return { canRegisterWithPassword: false as const };
    }
    const user = await authRepository.findUserByEmail(normalizedEmail);
    return { canRegisterWithPassword: !user };
  },

  async checkUsernameAvailable(raw: string) {
    const validation = validateUsername(raw);
    if (!validation.valid) {
      return { available: false as const, normalized: null as string | null, reason: validation.message };
    }
    const existing = await authRepository.findUserByUserName(validation.normalized);
    return {
      available: !existing,
      normalized: validation.normalized,
      reason: null as string | null,
    };
  },

  async registerManual(
    app: FastifyInstance,
    request: FastifyRequest,
    input: { email: string; password: string; userName: string; firstName?: string; lastName?: string },
  ) {
    const normalizedEmail = normalizeEmail(input.email);
    if (!normalizedEmail || !input.password || !input.userName) {
      logAuthFailure(app.log, "auth: register rejected — missing email, password, or username", {
        reason: "invalid_auth_request",
      });
      throw new AuthError(AUTH_MESSAGES.invalidAuthRequest, { statusCode: 400 });
    }
    const passwordValidation = validatePassword(input.password);
    if (!passwordValidation.valid) {
      logAuthFailure(app.log, "auth: register rejected — password policy", {
        reason: "password_validation_failed",
      });
      throw new AuthError(passwordValidation.message, { statusCode: 400, expose: true });
    }
    const userNameValidation = validateUsername(input.userName);
    if (!userNameValidation.valid) {
      logAuthFailure(app.log, "auth: register rejected — username validation", {
        reason: "username_validation_failed",
      });
      throw new AuthError(userNameValidation.message, { statusCode: 400, expose: true });
    }

    const existingUser = await authRepository.findUserByEmail(normalizedEmail);
    if (existingUser) {
      logAuthFailure(app.log, "auth: register rejected — email already registered", {
        reason: "email_in_use",
        email: normalizedEmail,
      });
      throw new AuthError(AUTH_MESSAGES.emailAlreadyRegistered, {
        statusCode: 409,
        expose: true,
        code: AUTH_CODES.EMAIL_IN_USE,
      });
    }

    const passwordHash = await hashPassword(input.password);

    let userId: string;
    try {
      const user = await authRepository.createUserWithWorkspace({
        email: normalizedEmail,
        userName: userNameValidation.normalized,
        firstName: input.firstName ?? "",
        lastName: input.lastName ?? "",
        passwordHash,
        provider: AuthProvider.LOCAL,
      });
      userId = user.id;
      await createAndSendVerificationEmail(app.log, normalizedEmail, user.id);
    } catch (error) {
      if (!isUniqueConstraintError(error)) {
        logAuthFailure(app.log, "auth: register failed during user creation", {
          reason: "create_user_error",
          err: error,
        });
        throw error;
      }
      const emailRace = await authRepository.findUserByEmail(normalizedEmail);
      if (emailRace) {
        logAuthFailure(app.log, "auth: register rejected — unique constraint, email taken (race)", {
          reason: "email_in_use_race",
          email: normalizedEmail,
        });
        throw new AuthError(AUTH_MESSAGES.emailAlreadyRegistered, {
          statusCode: 409,
          expose: true,
          code: AUTH_CODES.EMAIL_IN_USE,
        });
      }
      logAuthFailure(app.log, "auth: register rejected — unique constraint, username taken", {
        reason: "username_taken_race",
        userName: userNameValidation.normalized,
      });
      throw new AuthError(AUTH_MESSAGES.usernameTaken, {
        statusCode: 409,
        expose: true,
        code: AUTH_CODES.USERNAME_TAKEN,
      });
    }

    const tokens = await issueSessionTokens(userId, readSessionMeta(request));
    return tokens;
  },

  async loginManual(
    app: FastifyInstance,
    request: FastifyRequest,
    input: { email: string; password: string },
  ) {
    const normalizedEmail = normalizeEmail(input.email);
    if (!normalizedEmail || !input.password) {
      logAuthFailure(app.log, "auth: login rejected — missing email or password", {
        reason: "invalid_auth_request",
      });
      throw new AuthError(AUTH_MESSAGES.invalidAuthRequest, { statusCode: 400 });
    }

    const since = new Date(Date.now() - LOGIN_FAILURE_WINDOW_MS);
    const recentFailures = await authRepository.countFailedLoginAttemptsSince(normalizedEmail, since);
    if (recentFailures >= MAX_FAILED_LOGINS_PER_WINDOW) {
      logAuthFailure(app.log, "auth: login rejected — too many failed attempts", {
        reason: "rate_limited",
        email: normalizedEmail,
        recentFailures,
      });
      throw new AuthError(AUTH_MESSAGES.tooManyLoginAttempts, {
        statusCode: 429,
        expose: true,
        code: AUTH_CODES.TOO_MANY_ATTEMPTS,
      });
    }

    const user = await authRepository.findUserByEmail(normalizedEmail);
    if (!user) {
      await verifyPasswordAgainstDummyHash(input.password);
      await authRepository.recordFailedLoginAttempt(normalizedEmail);
      logAuthFailure(app.log, "auth: login failed — no user for email", {
        reason: "unknown_email",
        email: normalizedEmail,
      });
      throw new Error(AUTH_MESSAGES.invalidCredentials);
    }

    if (!user.passwordCredential) {
      await verifyPasswordAgainstDummyHash(input.password);
      await authRepository.recordFailedLoginAttempt(normalizedEmail);
      if (hasGoogleIdentity(user)) {
        logAuthFailure(app.log, "auth: login failed — Google-only account", {
          reason: "use_google",
          email: normalizedEmail,
          userId: user.id,
        });
        throw new AuthError(AUTH_MESSAGES.useGoogleSignIn, {
          statusCode: 401,
          expose: true,
          code: AUTH_CODES.USE_GOOGLE,
        });
      }
      logAuthFailure(app.log, "auth: login failed — no local password set", {
        reason: "no_password_credential",
        email: normalizedEmail,
        userId: user.id,
      });
      throw new Error(AUTH_MESSAGES.invalidCredentials);
    }

    const passwordOk = await verifyPassword(user.passwordCredential.passwordHash, input.password);
    if (!passwordOk) {
      await authRepository.recordFailedLoginAttempt(normalizedEmail);
      logAuthFailure(app.log, "auth: login failed — bad password", {
        reason: "invalid_password",
        email: normalizedEmail,
        userId: user.id,
      });
      throw new Error(AUTH_MESSAGES.invalidCredentials);
    }

    await authRepository.clearFailedLoginAttemptsForEmail(normalizedEmail);
    return issueSessionTokens(user.id, readSessionMeta(request));
  },

  async loginGoogle(
    app: FastifyInstance,
    request: FastifyRequest,
    input: { token: string },
  ) {
    if (!input.token) {
      logAuthFailure(app.log, "auth: Google login rejected — missing id token", {
        reason: "missing_google_token",
      });
      throw new AuthError(AUTH_MESSAGES.invalidAuthRequest, { statusCode: 400 });
    }
    let googleIdentity: GoogleIdentity;
    try {
      googleIdentity = await googleService.verifyIdToken(input.token);
    } catch (err) {
      logAuthFailure(app.log, "auth: Google login failed — id token verification error", {
        reason: "google_token_verify_failed",
        err,
      });
      throw err;
    }
    if (!googleIdentity.emailVerified) {
      logAuthFailure(app.log, "auth: Google login rejected — email not verified at Google", {
        reason: "google_email_unverified",
        sub: googleIdentity.sub,
      });
      throw unauthorizedError();
    }

    const existingGoogleIdentity =
      await authRepository.findGoogleIdentityByProviderAccountId(googleIdentity.sub);
    const normalizedEmail = normalizeEmail(googleIdentity.email);
    const existingUser = await authRepository.findUserByEmail(normalizedEmail);

    let userId: string;
    if (!existingUser) {
      if (existingGoogleIdentity) {
        logAuthFailure(app.log, "auth: Google login rejected — orphan Google identity", {
          reason: "google_identity_without_user",
          sub: googleIdentity.sub,
        });
        throw unauthorizedError();
      }
      const userName = await allocateUsernameFromEmail(app.log, normalizedEmail);
      const user = await authRepository.createUserWithWorkspace({
        email: normalizedEmail,
        userName,
        firstName: googleIdentity.firstName,
        lastName: googleIdentity.lastName,
        provider: AuthProvider.GOOGLE,
        providerAccountId: googleIdentity.sub,
        emailVerifiedAt: new Date(),
      });
      userId = user.id;
    } else {
      const currentGoogleIdentity = existingUser.authIdentities.find(
        (identity) => identity.provider === AuthProvider.GOOGLE,
      );
      if (
        currentGoogleIdentity?.providerAccountId &&
        currentGoogleIdentity.providerAccountId !== googleIdentity.sub
      ) {
        logAuthFailure(app.log, "auth: Google login rejected — sub mismatch for linked account", {
          reason: "google_sub_mismatch",
          userId: existingUser.id,
          storedSub: currentGoogleIdentity.providerAccountId,
          tokenSub: googleIdentity.sub,
        });
        throw unauthorizedError();
      }
      if (existingGoogleIdentity && existingGoogleIdentity.userId !== existingUser.id) {
        logAuthFailure(app.log, "auth: Google login rejected — Google account linked to another user", {
          reason: "google_identity_wrong_user",
          email: normalizedEmail,
          tokenUserId: existingGoogleIdentity.userId,
          emailUserId: existingUser.id,
        });
        throw unauthorizedError();
      }
      await authRepository.attachGoogleIdentity({
        userId: existingUser.id,
        providerAccountId: googleIdentity.sub,
      });
      if (!existingUser.emailVerifiedAt) {
        await authRepository.markUserEmailVerified(existingUser.id);
      }
      userId = existingUser.id;
    }

    return issueSessionTokens(userId, readSessionMeta(request));
  },

  async refresh(app: FastifyInstance, rawRefreshToken: string) {
    const now = new Date();
    const currentTokenHash = hashToken(rawRefreshToken);
    const currentToken = await authRepository.findRefreshTokenByHash(currentTokenHash);
    if (
      !currentToken ||
      currentToken.session.revokedAt ||
      currentToken.session.expiresAt <= now ||
      currentToken.expiresAt <= now
    ) {
      logAuthFailure(app.log, "auth: refresh rejected — invalid, revoked, or expired session", {
        reason: "refresh_token_invalid",
        found: Boolean(currentToken),
        revoked: currentToken?.session.revokedAt != null,
        expired:
          currentToken != null ? currentToken.session.expiresAt <= new Date() : undefined,
      });
      throw unauthorizedError();
    }

    const nextRawToken = tokenService.createRefreshToken();
    const rotateResult = await authRepository.rotateRefreshTokenAtomic({
      currentToken,
      nextTokenHash: hashToken(nextRawToken),
      nextExpiresAt: tokenService.refreshExpiresAt(),
    });

    if (rotateResult.status !== "ok") {
      logAuthFailure(app.log, "auth: refresh rejected — token reuse detected", {
        reason: rotateResult.status,
        sessionId: currentToken.sessionId,
        userId: currentToken.session.userId,
      });
      throw unauthorizedError();
    }

    const accessToken = await tokenService.createAccessToken({
      sub: currentToken.session.userId,
      sid: currentToken.session.id,
    });

    return {
      accessToken,
      refreshToken: nextRawToken,
      csrfToken: tokenService.createCsrfToken(),
    };
  },

  async logout(rawRefreshToken?: string) {
    if (!rawRefreshToken) return;
    const token = await authRepository.findRefreshTokenByHash(hashToken(rawRefreshToken));
    if (!token) return;
    await authRepository.revokeSession(token.sessionId, "logout");
  },

  async me(app: FastifyInstance, userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      logAuthFailure(app.log, "auth: /me failed — user id not found", {
        reason: "user_not_found",
        userId,
      });
      throw unauthorizedError();
    }
    return {
      user: {
        id: user.id,
        email: user.email,
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerifiedAt: user.emailVerifiedAt,
        providers: user.authIdentities.map((identity) => identity.provider),
      },
      account: user.memberships.map((membership) => ({
        membership: {
          id: membership.id,
          userId: membership.userId,
          accountId: membership.accountId,
          role: membership.role,
          createdAt: membership.createdAt,
        },
        account: {
          id: membership.account.id,
          name: membership.account.name,
          createdAt: membership.account.createdAt,
        },
      })),
    };
  },

  async resendVerification(app: FastifyInstance, email: string) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) return;
    const user = await authRepository.findUserByEmail(normalizedEmail);
    if (!user || user.emailVerifiedAt) return;
    await createAndSendVerificationEmail(app.log, normalizedEmail, user.id);
  },

  async verifyEmail(app: FastifyInstance, rawToken: string) {
    const token = await authRepository.consumeEmailActionToken({
      type: EmailActionType.EMAIL_VERIFICATION,
      tokenHash: hashToken(rawToken),
    });
    if (!token) {
      logAuthFailure(app.log, "auth: verify email rejected — invalid or consumed token", {
        reason: "invalid_verification_token",
      });
      throw new AuthError(AUTH_MESSAGES.invalidToken, { statusCode: 400, expose: true });
    }
    await authRepository.markUserEmailVerified(token.userId);
    await authRepository.invalidateEmailActionTokens({
      userId: token.userId,
      type: EmailActionType.EMAIL_VERIFICATION,
    });
  },

  async requestPasswordReset(email: string) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) return;
    const user = await authRepository.findUserByEmail(normalizedEmail);
    if (!user) return;

    await authRepository.invalidateEmailActionTokens({
      userId: user.id,
      type: EmailActionType.PASSWORD_RESET,
    });
    const rawToken = tokenService.createRefreshToken();
    await authRepository.createEmailActionToken({
      userId: user.id,
      type: EmailActionType.PASSWORD_RESET,
      tokenHash: hashToken(rawToken),
      expiresAt: addSeconds(AUTH_TTL.resetTokenSeconds),
    });
    const message = buildPasswordResetEmail(rawToken);
    await mailService.sendEmail({
      to: normalizedEmail,
      ...message,
    });
  },

  async confirmPasswordReset(app: FastifyInstance, input: { token: string; password: string }) {
    if (!input.token || !input.password) {
      logAuthFailure(app.log, "auth: password reset confirm rejected — missing token or password", {
        reason: "invalid_auth_request",
      });
      throw new AuthError(AUTH_MESSAGES.invalidAuthRequest, { statusCode: 400 });
    }
    const passwordValidation = validatePassword(input.password);
    if (!passwordValidation.valid) {
      logAuthFailure(app.log, "auth: password reset confirm rejected — password policy", {
        reason: "password_validation_failed",
      });
      throw new AuthError(passwordValidation.message, { statusCode: 400, expose: true });
    }
    const token = await authRepository.consumeEmailActionToken({
      type: EmailActionType.PASSWORD_RESET,
      tokenHash: hashToken(input.token),
    });
    if (!token) {
      logAuthFailure(app.log, "auth: password reset confirm rejected — invalid or consumed token", {
        reason: "invalid_reset_token",
      });
      throw new AuthError(AUTH_MESSAGES.invalidToken, { statusCode: 400, expose: true });
    }

    const nextPasswordHash = await hashPassword(input.password);
    await authRepository.updatePassword(token.userId, nextPasswordHash);

    await authRepository.invalidateEmailActionTokens({
      userId: token.userId,
      type: EmailActionType.PASSWORD_RESET,
    });

    // Security-first default: force re-authentication across devices after password change.
    await authRepository.revokeAllSessionsForUser(token.userId, "password_reset");
  },
};
