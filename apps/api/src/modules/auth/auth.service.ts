import type { FastifyInstance, FastifyRequest } from "fastify";
import type { FastifyBaseLogger } from "fastify/types/logger";
import { AuthProvider, EmailActionType } from "../../generated/prisma";
import { AUTH_CODES, AUTH_MESSAGES, AUTH_TTL } from "./constants";
import { authRepository } from "./repository";
import { googleService, type GoogleIdentity } from "./googleService";
import { buildPasswordResetEmail, buildWelcomeEmail } from "../email/templates/authTemplates";
import { mailService } from "../email/mailService";
import { tokenService } from "./tokenService";
import {
  addSeconds,
  hashPassword,
  hashToken,
  normalizeEmail,
  validatePassword,
  verifyPassword,
  verifyPasswordAgainstDummyHash,
} from "./utils";
import { AuthError } from "./errors";
import { userService } from "../user/user.service";
import { paymentsRepository } from "../payments/payments.repository";
import { sendVerificationEmail } from "./verificationEmail";
import { resolveRequestCountryCode } from "../../utils/requestCountry";
import { validateUsername } from "../../utils/usernameValidation";
import { stripDangerousControlChars } from "../../utils/sqlSafeInput";
import { recordDebugAuthLog } from "./debugAuthLog";

type SessionMeta = {
  ip?: string;
  userAgent?: string;
};

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
};

export type RegisterManualResult =
  | { status: "session"; tokens: AuthTokens }
  | { status: "neutral" };

type GoogleSignupProfile = {
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
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
  const user = await authRepository.findUserById(userId);
  if (!user) throw unauthorizedError();

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
    userName: user.userName ?? "",
    avatar: user.avatar ?? "",
    emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
  });
  return { accessToken, refreshToken, csrfToken };
};

const LOGIN_FAILURE_WINDOW_MS = 60 * 60 * 1000;
const MAX_FAILED_LOGINS_PER_WINDOW = 5;

const hasGoogleIdentity = (user: { authIdentities: { provider: AuthProvider }[] }) =>
  user.authIdentities.some((i) => i.provider === AuthProvider.GOOGLE);

export const authService = {
  async registerManual(
    app: FastifyInstance,
    request: FastifyRequest,
    input: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
      avatar?: string;
    },
  ): Promise<RegisterManualResult> {
    if (!input.password) {
      logAuthFailure(app.log, "auth: register rejected — missing email or password", {
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

    const passwordHash = await hashPassword(input.password);
    const countryCode = resolveRequestCountryCode(request);
    const userAgent =
      typeof request.headers["user-agent"] === "string" ? request.headers["user-agent"] : null;

    let registerResult: Awaited<ReturnType<typeof userService.registerNewLocalUser>>;
    try {
      registerResult = await userService.registerNewLocalUser({
        emailRaw: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        avatar: input.avatar,
        log: app.log,
        countryCode,
        ip: request.ip,
        userAgent,
      });
    } catch (error) {
      if (error instanceof AuthError) throw error;
      logAuthFailure(app.log, "auth: register failed during user creation", {
        reason: "create_user_error",
        err: error,
      });
      throw error;
    }

    if (registerResult.outcome === "duplicate_handled") {
      return { status: "neutral" };
    }

    await sendVerificationEmail(app.log, registerResult.normalizedEmail, registerResult.userId);
    const tokens = await issueSessionTokens(registerResult.userId, readSessionMeta(request));
    return { status: "session", tokens };
  },

  async completeRegistrationUsername(
    app: FastifyInstance,
    request: FastifyRequest,
    userNameRaw: string,
  ): Promise<AuthTokens> {
    const userId = request.user?.sub;
    if (!userId) throw unauthorizedError();

    const trimmed = userNameRaw?.trim() ?? "";
    if (!trimmed) {
      throw new AuthError(AUTH_MESSAGES.invalidAuthRequest, { statusCode: 400 });
    }
    const userNameValidation = validateUsername(stripDangerousControlChars(trimmed));
    if (!userNameValidation.valid) {
      throw new AuthError(userNameValidation.message, { statusCode: 400, expose: true });
    }

    const result = await userService.setUsernameForVerifiedUser({ userId, userNameRaw: trimmed });
    if (result.ok) {
      return issueSessionTokens(userId, readSessionMeta(request));
    }
    switch (result.reason) {
      case "email_not_verified":
        throw new AuthError(AUTH_MESSAGES.unauthorized, { statusCode: 403 });
      case "already_set":
        throw new AuthError(AUTH_MESSAGES.invalidAuthRequest, { statusCode: 400 });
      case "username_invalid":
        throw new AuthError(AUTH_MESSAGES.invalidAuthRequest, { statusCode: 400 });
      case "username_taken":
        throw new AuthError(AUTH_MESSAGES.usernameTaken, {
          statusCode: 409,
          expose: true,
          code: AUTH_CODES.USERNAME_TAKEN,
        });
      default:
        throw unauthorizedError();
    }
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
    const googleIdentity = await verifyAndNormalizeGoogleIdentity(app, input.token);

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
      const userName = await userService.allocateUniqueUsernameFromEmail(app.log, normalizedEmail);
      const { userId: newId } = await userService.createGoogleUserOnFirstLogin({
        normalizedEmail,
        userName,
        firstName: googleIdentity.firstName,
        lastName: googleIdentity.lastName,
        avatar: googleIdentity.avatar,
        providerAccountId: googleIdentity.sub,
      });
      userId = newId;
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
      if (googleIdentity.avatar) {
        await authRepository.updateGoogleAvatarIfNotManual(existingUser.id, googleIdentity.avatar);
      }
      if (!existingUser.emailVerifiedAt) {
        await authRepository.markUserEmailVerified(existingUser.id);
      }
      userId = existingUser.id;
    }

    return issueSessionTokens(userId, readSessionMeta(request));
  },

  async loginGoogleForLoginFlow(
    app: FastifyInstance,
    request: FastifyRequest,
    input: { token: string },
  ): Promise<
    | { status: "authenticated"; tokens: AuthTokens }
    | { status: "signup_required"; profile: GoogleSignupProfile }
  > {
    if (!input.token) {
      logAuthFailure(app.log, "auth: Google login flow rejected — missing id token", {
        reason: "missing_google_token",
      });
      throw new AuthError(AUTH_MESSAGES.invalidAuthRequest, { statusCode: 400 });
    }

    const googleIdentity = await verifyAndNormalizeGoogleIdentity(app, input.token);
    const existingGoogleIdentity =
      await authRepository.findGoogleIdentityByProviderAccountId(googleIdentity.sub);
    const normalizedEmail = normalizeEmail(googleIdentity.email);
    const existingUser = await authRepository.findUserByEmail(normalizedEmail);

    if (!existingUser) {
      if (existingGoogleIdentity) {
        logAuthFailure(app.log, "auth: Google login flow rejected — orphan Google identity", {
          reason: "google_identity_without_user",
          sub: googleIdentity.sub,
        });
        throw unauthorizedError();
      }
      return {
        status: "signup_required",
        profile: {
          email: normalizedEmail,
          firstName: googleIdentity.firstName,
          lastName: googleIdentity.lastName,
          avatar: googleIdentity.avatar,
        },
      };
    }

    const currentGoogleIdentity = existingUser.authIdentities.find(
      (identity) => identity.provider === AuthProvider.GOOGLE,
    );
    if (
      currentGoogleIdentity?.providerAccountId &&
      currentGoogleIdentity.providerAccountId !== googleIdentity.sub
    ) {
      logAuthFailure(app.log, "auth: Google login flow rejected — sub mismatch for linked account", {
        reason: "google_sub_mismatch",
        userId: existingUser.id,
        storedSub: currentGoogleIdentity.providerAccountId,
        tokenSub: googleIdentity.sub,
      });
      throw unauthorizedError();
    }
    if (existingGoogleIdentity && existingGoogleIdentity.userId !== existingUser.id) {
      logAuthFailure(app.log, "auth: Google login flow rejected — Google account linked to another user", {
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
    if (googleIdentity.avatar) {
      await authRepository.updateGoogleAvatarIfNotManual(existingUser.id, googleIdentity.avatar);
    }
    if (!existingUser.emailVerifiedAt) {
      await authRepository.markUserEmailVerified(existingUser.id);
    }

    return {
      status: "authenticated",
      tokens: await issueSessionTokens(existingUser.id, readSessionMeta(request)),
    };
  },

  async registerGoogleWithUsername(
    app: FastifyInstance,
    request: FastifyRequest,
    input: {
      token: string;
      userName: string;
      firstName?: string;
      lastName?: string;
      avatar?: string;
    },
  ) {
    if (!input.token || !input.userName) {
      throw new AuthError(AUTH_MESSAGES.invalidAuthRequest, { statusCode: 400 });
    }

    const googleIdentity = await verifyAndNormalizeGoogleIdentity(app, input.token);
    const normalizedEmail = normalizeEmail(googleIdentity.email);

    const { userId } = await userService.registerNewGoogleUserWithUsername({
      normalizedEmail,
      userNameRaw: input.userName,
      firstName: input.firstName ?? googleIdentity.firstName,
      lastName: input.lastName ?? googleIdentity.lastName,
      avatar: input.avatar ?? googleIdentity.avatar,
      providerAccountId: googleIdentity.sub,
    });

    await mailService.sendEmail({
      to: normalizedEmail,
      ...buildWelcomeEmail(),
    });

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
      const detail = {
        found: Boolean(currentToken),
        revoked: currentToken?.session.revokedAt != null,
        sessionExpired:
          currentToken != null ? currentToken.session.expiresAt <= now : undefined,
        refreshExpired: currentToken != null ? currentToken.expiresAt <= now : undefined,
        revokeReason: currentToken?.session.revokeReason ?? null,
      };
      logAuthFailure(app.log, "auth: refresh rejected — invalid, revoked, or expired session", {
        reason: "refresh_token_invalid",
        ...detail,
      });
      void recordDebugAuthLog(
        {
          source: "api",
          event: "refresh_rejected",
          reason: "refresh_token_invalid",
          message: "auth: refresh rejected — invalid, revoked, or expired session",
          userId: currentToken?.session.userId ?? null,
          sessionId: currentToken?.sessionId ?? null,
          detail,
        },
        app.log,
      );
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
      void recordDebugAuthLog(
        {
          source: "api",
          event: "refresh_rejected",
          reason:
            rotateResult.status === "reused"
              ? "refresh_token_reuse"
              : `refresh_rotate_${rotateResult.status}`,
          message: `auth: refresh rejected — rotate status ${rotateResult.status}`,
          userId: currentToken.session.userId,
          sessionId: currentToken.sessionId,
          detail: { rotateStatus: rotateResult.status },
        },
        app.log,
      );
      throw unauthorizedError();
    }

    const user = await authRepository.findUserById(currentToken.session.userId);
    if (!user) {
      void recordDebugAuthLog(
        {
          source: "api",
          event: "refresh_rejected",
          reason: "user_not_found",
          message: "auth: refresh rejected — user missing after rotate",
          userId: currentToken.session.userId,
          sessionId: currentToken.sessionId,
        },
        app.log,
      );
      throw unauthorizedError();
    }

    const accessToken = await tokenService.createAccessToken({
      sub: currentToken.session.userId,
      sid: currentToken.session.id,
      userName: user.userName ?? "",
      avatar: user.avatar ?? "",
      emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
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
    const purchasesCount = await paymentsRepository.countCompletedPurchases(user.id);
    return {
      user: {
        id: user.id,
        email: user.email,
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        avatarManuallySet: user.avatarManuallySet,
        emailVerifiedAt: user.emailVerifiedAt,
        providers: user.authIdentities.map((identity) => identity.provider),
        purchasesCount,
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
    await sendVerificationEmail(app.log, normalizedEmail, user.id);
  },

  /** Signed-in resend: the session's own address, at most once per cooldown window. */
  async resendVerificationForUser(
    app: FastifyInstance,
    userId: string,
  ): Promise<{ status: "sent" } | { status: "already_verified" } | { status: "cooldown" }> {
    const user = await authRepository.findUserById(userId);
    if (!user) throw unauthorizedError();
    if (user.emailVerifiedAt) return { status: "already_verified" };
    const lastSentAt = await authRepository.findLatestEmailActionTokenCreatedAt({
      userId,
      type: EmailActionType.EMAIL_VERIFICATION,
    });
    const cooldownMs = AUTH_TTL.verificationResendCooldownSeconds * 1000;
    if (lastSentAt && Date.now() - lastSentAt.getTime() < cooldownMs) return { status: "cooldown" };
    await sendVerificationEmail(app.log, user.email, user.id);
    return { status: "sent" };
  },

  async verifyEmail(
    app: FastifyInstance,
    rawToken: string,
  ): Promise<
    | { status: "verified" }
    | { status: "already_verified" }
    | { status: "expired"; email: string | null }
    | { status: "invalid" }
  > {
    const tokenHash = hashToken(rawToken);
    const existingToken = await authRepository.findEmailActionTokenByHash(tokenHash);
    if (!existingToken || existingToken.type !== EmailActionType.EMAIL_VERIFICATION) {
      logAuthFailure(app.log, "auth: verify email rejected — token not found", {
        reason: "invalid_verification_token",
      });
      return { status: "invalid" };
    }
    if (existingToken.expiresAt <= new Date()) {
      return { status: "expired", email: existingToken.user.email ?? null };
    }
    if (existingToken.usedAt || existingToken.invalidatedAt) {
      if (existingToken.user.emailVerifiedAt) {
        return { status: "already_verified" };
      }
      logAuthFailure(app.log, "auth: verify email rejected — token already used/invalidated", {
        reason: "invalid_verification_token",
      });
      return { status: "invalid" };
    }

    const consumedToken = await authRepository.consumeEmailActionToken({
      type: EmailActionType.EMAIL_VERIFICATION,
      tokenHash,
    });
    if (!consumedToken) {
      const user = await authRepository.findUserById(existingToken.userId);
      if (user?.emailVerifiedAt) return { status: "already_verified" };
      logAuthFailure(app.log, "auth: verify email rejected — consume failed", {
        reason: "invalid_verification_token",
      });
      return { status: "invalid" };
    }

    await authRepository.markUserEmailVerified(consumedToken.userId);
    await authRepository.invalidateEmailActionTokens({
      userId: consumedToken.userId,
      type: EmailActionType.EMAIL_VERIFICATION,
    });
    if (existingToken.user.email) {
      await mailService.sendEmail({
        to: existingToken.user.email,
        ...buildWelcomeEmail(),
      });
    }
    return { status: "verified" };
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
    void recordDebugAuthLog(
      {
        source: "api",
        event: "sessions_revoked",
        reason: "password_reset",
        message: "auth: all sessions revoked after password reset confirm",
        userId: token.userId,
        detail: { revokeReason: "password_reset" },
      },
      app.log,
    );
  },
};

const verifyAndNormalizeGoogleIdentity = async (
  app: FastifyInstance,
  token: string,
): Promise<GoogleIdentity> => {
  let googleIdentity: GoogleIdentity;
  try {
    googleIdentity = await googleService.verifyGoogleToken(token);
  } catch (err) {
    logAuthFailure(app.log, "auth: Google login failed — token verification error", {
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
  return googleIdentity;
};
