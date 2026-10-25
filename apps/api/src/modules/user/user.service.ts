import { randomBytes } from "node:crypto";
import type { FastifyBaseLogger } from "fastify/types/logger";
import { AuthProvider, EmailActionType } from "../../generated/prisma";
import { prismaClient } from "../../lib/prisma";
import { authRepository } from "../auth/repository";
import { recordDebugAuthLog } from "../auth/debugAuthLog";
import { sendVerificationEmail } from "../auth/verificationEmail";
import { AUTH_CODES, AUTH_MESSAGES, AUTH_TTL } from "../auth/constants";
import { AuthError } from "../auth/errors";
import { hashPassword, hashToken } from "../auth/utils";
import { tokenService } from "../auth/tokenService";
import {
  buildEmailChangePreviousAddressAlert,
  buildEmailChangeVerificationEmail,
  buildSuspiciousRegistrationAttemptEmail,
} from "../email/templates/authTemplates";
import { mailService } from "../email/mailService";
import { formatCountryLabel } from "../../utils/requestCountry";
import { cleanText } from "../../utils/text";
import { normalizeEmail, isValidEmailFormat } from "../../utils/emailValidation";
import { normalizeUsername, validateUsername } from "../../utils/usernameValidation";
import { stripDangerousControlChars } from "../../utils/sqlSafeInput";
import { isUniqueConstraintError } from "../../utils/prismaErrors";

const EMAIL_CHANGE_TTL_MS = 24 * 60 * 60 * 1000;
/** Outlives the 24h confirmation link so an already-confirmed takeover can still be undone. */
export const EMAIL_CHANGE_REVERT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type EmailChangeRevertTokenState = "valid" | "invalid" | "expired" | "used";
/** `unavailable`: the old address now belongs to another account that verified it, so the link is dead. */
type EmailChangeRevertBlocked = Exclude<EmailChangeRevertTokenState, "valid"> | "unavailable";

export type EmailChangeRevertPreview =
  | { status: "valid"; restoreEmail: string; changedToEmail: string }
  | { status: EmailChangeRevertBlocked };

export type EmailChangeRevertResult =
  | { status: "reverted" | "email_taken"; restoredEmail: string; passwordResetToken?: string }
  | { status: EmailChangeRevertBlocked };

/** Another account owns the old address and proved it (verified), so it can never be restored. */
async function isRestoreEmailClaimed(token: { userId: string; restoreEmail: string }): Promise<boolean> {
  const occupant = await prismaClient.user.findUnique({
    where: { email: token.restoreEmail },
    select: { id: true, emailVerifiedAt: true },
  });
  return Boolean(occupant && occupant.id !== token.userId && occupant.emailVerifiedAt);
}

function revertTokenState(
  token: { usedAt: Date | null; expiresAt: Date } | null,
  now: Date,
): EmailChangeRevertTokenState {
  if (!token) return "invalid";
  if (token.usedAt) return "used";
  if (token.expiresAt <= now) return "expired";
  return "valid";
}

/** Swaps the email back, burns every other credential-ish token, and disables the password. */
async function applyEmailChangeRevert(params: { userId: string; restoreEmail: string; disabledPasswordHash: string }) {
  const { userId, restoreEmail } = params;
  return prismaClient.$transaction(async (tx) => {
    const now = new Date();
    await tx.userEmailChangeRequest.updateMany({
      where: { userId, consumedAt: null, invalidatedAt: null },
      data: { invalidatedAt: now },
    });
    // A later alert (e.g. to an attacker's address) must not be able to undo this revert.
    await tx.emailChangeRevertToken.updateMany({ where: { userId, usedAt: null }, data: { usedAt: now } });
    await tx.emailActionToken.updateMany({
      where: { userId, usedAt: null, invalidatedAt: null },
      data: { invalidatedAt: now },
    });

    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { email: true, passwordCredential: { select: { id: true } } },
    });
    if (!user) return null;

    let emailTaken = false;
    if (user.email !== restoreEmail) {
      const occupant = await tx.user.findUnique({ where: { email: restoreEmail }, select: { id: true } });
      emailTaken = Boolean(occupant && occupant.id !== userId);
      if (!emailTaken) {
        await tx.user.update({ where: { id: userId }, data: { email: restoreEmail, emailVerifiedAt: now } });
      }
    }

    if (!user.passwordCredential) return { emailTaken, passwordResetToken: undefined };
    await tx.passwordCredential.update({ where: { userId }, data: { passwordHash: params.disabledPasswordHash } });
    const passwordResetToken = tokenService.createRefreshToken();
    await tx.emailActionToken.create({
      data: {
        userId,
        type: EmailActionType.PASSWORD_RESET,
        tokenHash: hashToken(passwordResetToken),
        expiresAt: new Date(now.getTime() + AUTH_TTL.resetTokenSeconds * 1000),
      },
    });
    return { emailTaken, passwordResetToken };
  });
}

type AuthFailureLog = { warn: (detail: Record<string, unknown>, message: string) => void };

async function recordDuplicatePasswordRegistrationAttempt(params: {
  log: FastifyBaseLogger;
  normalizedEmail: string;
  countryCode: string;
  ip?: string;
  userAgent?: string | null;
  matchedUser: { id: string; email: string; emailVerifiedAt: Date | null };
}) {
  await prismaClient.suspiciousRegistrationAttempt.create({
    data: {
      normalizedEmail: params.normalizedEmail,
      countryCode: params.countryCode,
      ip: params.ip ?? null,
      userAgent: params.userAgent ?? null,
      matchedUserId: params.matchedUser.id,
    },
  });

  if (params.matchedUser.emailVerifiedAt) {
    await mailService.sendEmail({
      to: params.matchedUser.email,
      ...buildSuspiciousRegistrationAttemptEmail({
        countryLabel: formatCountryLabel(params.countryCode),
      }),
    });
  } else {
    await sendVerificationEmail(params.log, params.normalizedEmail, params.matchedUser.id);
  }
}

export type ProfileUpdateFailure =
  | { kind: "not_found" }
  | { kind: "invalid"; message: string }
  | { kind: "username_taken" };

/**
 * The profile "nickname" is the account's unique `userName`: same rules as registration. It can't be
 * cleared, since a user without one is sent back to complete registration.
 */
function resolveUserNameUpdate(
  raw: unknown,
  current: string | null,
): { kind: "skip" } | { kind: "set"; value: string } | { kind: "invalid"; message: string } {
  if (typeof raw !== "string") return { kind: "skip" };
  const validation = validateUsername(stripDangerousControlChars(raw));
  if (!validation.valid) return { kind: "invalid", message: validation.message };
  if (validation.normalized === current) return { kind: "skip" };
  return { kind: "set", value: validation.normalized };
}

export type UserProfileView = {
  id: string;
  email: string;
  userName: string | null;
  firstName: string;
  lastName: string;
  avatar: string;
  avatarManuallySet: boolean;
  emailVerifiedAt: string | null;
  providers: AuthProvider[];
  pendingEmailChange: {
    newEmail: string;
    expiresAt: string;
    requestedAt: string;
  } | null;
  configuration: UserConfigurationDto;
};

type UserConfigurationDto = {
  theme: string;
  language: string;
  /** Null = follow the user's local clock. */
  celestialSlot: number | null;
};

const SUPPORTED_THEMES = new Set(["tokyo-dusk", "sumie", "night-sky"]);
const SUPPORTED_LANGUAGES = new Set(["en", "ja", "es", "fr", "th", "de", "it", "pt", "zh", "vi"]);
const CELESTIAL_SLOT_MAX = 95;

/** `undefined` = not provided, `null` = reset to clock, number = explicit slot; `false` = invalid. */
function parseCelestialSlot(value: unknown): number | null | undefined | false {
  if (value === undefined || value === null) return value;
  if (typeof value !== "number" || !Number.isInteger(value)) return false;
  return value >= 0 && value <= CELESTIAL_SLOT_MAX ? value : false;
}

function toConfigurationDto(
  configuration: { theme: string; language: string; celestialSlot: number | null } | null | undefined,
): UserConfigurationDto {
  return {
    theme: configuration?.theme ?? "tokyo-dusk",
    language: configuration?.language ?? "en",
    celestialSlot: configuration?.celestialSlot ?? null,
  };
}

export const userService = {
  async checkEmailForPasswordRegistration(emailRaw: string) {
    const normalized = normalizeEmail(emailRaw);
    if (!normalized || !isValidEmailFormat(normalized)) {
      return { canRegisterWithPassword: false as const };
    }
    const user = await authRepository.findUserByEmail(normalized);
    return { canRegisterWithPassword: !user };
  },

  async checkUsernameAvailable(raw: string) {
    const validation = validateUsername(stripDangerousControlChars(raw));
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

  async allocateUniqueUsernameFromEmail(log: AuthFailureLog, email: string): Promise<string> {
    const localPart = email.split("@")[0] ?? "user";
    const base = normalizeUsername(localPart.replace(/\./g, "_")) || "user";
    for (let i = 0; i < 100; i++) {
      const suffix = i === 0 ? "" : `_${i}`;
      const maxBase = 32 - suffix.length;
      const candidate = (base.slice(0, Math.max(1, maxBase)) + suffix).toLowerCase();
      const taken = await authRepository.findUserByUserName(candidate);
      if (!taken) return candidate;
    }
    log.warn(
      { reason: "username_candidates_exhausted", authFailure: true },
      "user: could not allocate unique username from email",
    );
    throw new AuthError(AUTH_MESSAGES.invalidAuthRequest, { statusCode: 400 });
  },

  async registerNewLocalUser(params: {
    emailRaw: string;
    passwordHash: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    log: FastifyBaseLogger;
    countryCode: string;
    ip?: string;
    userAgent?: string | null;
  }): Promise<
    | { outcome: "created"; userId: string; normalizedEmail: string }
    | { outcome: "duplicate_handled"; normalizedEmail: string }
  > {
    const normalizedEmail = normalizeEmail(stripDangerousControlChars(params.emailRaw));
    if (!normalizedEmail || !isValidEmailFormat(normalizedEmail)) {
      throw new AuthError(AUTH_MESSAGES.invalidAuthRequest, { statusCode: 400 });
    }
    const existingUser = await authRepository.findUserByEmail(normalizedEmail);
    if (existingUser) {
      await recordDuplicatePasswordRegistrationAttempt({
        log: params.log,
        normalizedEmail,
        countryCode: params.countryCode,
        ip: params.ip,
        userAgent: params.userAgent,
        matchedUser: {
          id: existingUser.id,
          email: existingUser.email,
          emailVerifiedAt: existingUser.emailVerifiedAt,
        },
      });
      return { outcome: "duplicate_handled", normalizedEmail };
    }
    const firstName = cleanText(params.firstName, 120) ?? "";
    const lastName = cleanText(params.lastName, 120) ?? "";
    const avatar = cleanText(params.avatar, 2048) ?? "";
    try {
      const user = await authRepository.createUserWithWorkspace({
        email: normalizedEmail,
        userName: null,
        firstName,
        lastName,
        avatar,
        passwordHash: params.passwordHash,
        provider: AuthProvider.LOCAL,
      });
      return { outcome: "created", userId: user.id, normalizedEmail };
    } catch (error) {
      if (!isUniqueConstraintError(error)) throw error;
      const emailRace = await authRepository.findUserByEmail(normalizedEmail);
      if (emailRace) {
        await recordDuplicatePasswordRegistrationAttempt({
          log: params.log,
          normalizedEmail,
          countryCode: params.countryCode,
          ip: params.ip,
          userAgent: params.userAgent,
          matchedUser: {
            id: emailRace.id,
            email: emailRace.email,
            emailVerifiedAt: emailRace.emailVerifiedAt,
          },
        });
        return { outcome: "duplicate_handled", normalizedEmail };
      }
      throw new AuthError(AUTH_MESSAGES.usernameTaken, {
        statusCode: 409,
        expose: true,
        code: AUTH_CODES.USERNAME_TAKEN,
      });
    }
  },

  async setUsernameForVerifiedUser(params: {
    userId: string;
    userNameRaw: string;
  }): Promise<
    | { ok: true }
    | {
        ok: false;
        reason:
          | "not_found"
          | "email_not_verified"
          | "username_invalid"
          | "username_taken"
          | "already_set";
      }
  > {
    const user = await prismaClient.user.findUnique({ where: { id: params.userId } });
    if (!user) return { ok: false, reason: "not_found" };
    if (!user.emailVerifiedAt) return { ok: false, reason: "email_not_verified" };
    if (user.userName) return { ok: false, reason: "already_set" };
    const validation = validateUsername(stripDangerousControlChars(params.userNameRaw));
    if (!validation.valid) return { ok: false, reason: "username_invalid" };
    try {
      await prismaClient.user.update({
        where: { id: params.userId },
        data: { userName: validation.normalized },
      });
      return { ok: true };
    } catch (error) {
      if (isUniqueConstraintError(error)) return { ok: false, reason: "username_taken" };
      throw error;
    }
  },

  async registerNewGoogleUserWithUsername(params: {
    normalizedEmail: string;
    userNameRaw: string;
    firstName: string;
    lastName: string;
    avatar: string;
    providerAccountId: string;
  }): Promise<{ userId: string }> {
    const email = normalizeEmail(stripDangerousControlChars(params.normalizedEmail));
    if (!email || !isValidEmailFormat(email)) {
      throw new AuthError(AUTH_MESSAGES.invalidAuthRequest, { statusCode: 400 });
    }
    const userNameValidation = validateUsername(stripDangerousControlChars(params.userNameRaw));
    if (!userNameValidation.valid) {
      throw new AuthError(userNameValidation.message, { statusCode: 400, expose: true });
    }
    const existingUser = await authRepository.findUserByEmail(email);
    if (existingUser) {
      throw new AuthError(AUTH_MESSAGES.emailAlreadyRegistered, {
        statusCode: 409,
        expose: true,
        code: AUTH_CODES.EMAIL_IN_USE,
      });
    }
    const existingGoogleIdentity = await authRepository.findGoogleIdentityByProviderAccountId(
      params.providerAccountId,
    );
    if (existingGoogleIdentity) {
      throw new AuthError(AUTH_MESSAGES.unauthorized, { statusCode: 401 });
    }
    const firstName = cleanText(stripDangerousControlChars(params.firstName), 120) ?? "";
    const lastName = cleanText(stripDangerousControlChars(params.lastName), 120) ?? "";
    const avatar = cleanText(stripDangerousControlChars(params.avatar), 2048) ?? "";
    try {
      const user = await authRepository.createUserWithWorkspace({
        email,
        userName: userNameValidation.normalized,
        firstName,
        lastName,
        avatar,
        provider: AuthProvider.GOOGLE,
        providerAccountId: params.providerAccountId,
        emailVerifiedAt: new Date(),
      });
      return { userId: user.id };
    } catch (error) {
      if (!isUniqueConstraintError(error)) throw error;
      const emailRace = await authRepository.findUserByEmail(email);
      if (emailRace) {
        throw new AuthError(AUTH_MESSAGES.emailAlreadyRegistered, {
          statusCode: 409,
          expose: true,
          code: AUTH_CODES.EMAIL_IN_USE,
        });
      }
      throw new AuthError(AUTH_MESSAGES.usernameTaken, {
        statusCode: 409,
        expose: true,
        code: AUTH_CODES.USERNAME_TAKEN,
      });
    }
  },

  async createGoogleUserOnFirstLogin(params: {
    normalizedEmail: string;
    userName: string;
    firstName: string;
    lastName: string;
    avatar: string;
    providerAccountId: string;
  }) {
    const email = normalizeEmail(stripDangerousControlChars(params.normalizedEmail));
    if (!email || !isValidEmailFormat(email)) {
      throw new AuthError(AUTH_MESSAGES.invalidAuthRequest, { statusCode: 400 });
    }
    const firstName = cleanText(stripDangerousControlChars(params.firstName), 120) ?? "";
    const lastName = cleanText(stripDangerousControlChars(params.lastName), 120) ?? "";
    const avatar = cleanText(stripDangerousControlChars(params.avatar), 2048) ?? "";
    const user = await authRepository.createUserWithWorkspace({
      email,
      userName: params.userName,
      firstName,
      lastName,
      avatar,
      provider: AuthProvider.GOOGLE,
      providerAccountId: params.providerAccountId,
      emailVerifiedAt: new Date(),
    });
    return { userId: user.id };
  },

  async getOwnProfile(userId: string): Promise<UserProfileView | null> {
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      include: {
        authIdentities: true,
        emailChangeRequests: {
          where: {
            consumedAt: null,
            invalidatedAt: null,
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        configuration: true,
      },
    });
    if (!user) return null;
    const pending = user.emailChangeRequests[0] ?? null;
    return {
      id: user.id,
      email: user.email,
      userName: user.userName,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      avatarManuallySet: user.avatarManuallySet,
      emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
      providers: user.authIdentities.map((v) => v.provider),
      pendingEmailChange: pending
        ? {
            newEmail: pending.newEmail,
            expiresAt: pending.expiresAt.toISOString(),
            requestedAt: pending.createdAt.toISOString(),
          }
        : null,
      configuration: toConfigurationDto(user.configuration),
    };
  },

  async updateOwnProfile(params: {
    userId: string;
    payload: Record<string, unknown>;
  }): Promise<{ ok: true; profile: UserProfileView } | { ok: false; reason: ProfileUpdateFailure }> {
    const existing = await prismaClient.user.findUnique({ where: { id: params.userId } });
    if (!existing) return { ok: false, reason: { kind: "not_found" } };

    const userName = resolveUserNameUpdate(params.payload.userName, existing.userName);
    if (userName.kind === "invalid") return { ok: false, reason: userName };

    const firstName = cleanText(params.payload.firstName, 120);
    const lastName = cleanText(params.payload.lastName, 120);

    const data: {
      firstName?: string;
      lastName?: string;
      userName?: string;
    } = {};
    if (firstName !== undefined) data.firstName = firstName;
    if (lastName !== undefined) data.lastName = lastName;
    if (userName.kind === "set") data.userName = userName.value;

    if (Object.keys(data).length > 0) {
      try {
        await prismaClient.user.update({
          where: { id: params.userId },
          data,
        });
      } catch (error) {
        if (isUniqueConstraintError(error)) return { ok: false, reason: { kind: "username_taken" } };
        throw error;
      }
    }

    const profile = await userService.getOwnProfile(params.userId);
    if (!profile) return { ok: false, reason: { kind: "not_found" } };
    return { ok: true, profile };
  },

  async updateOwnAvatar(params: {
    userId: string;
    avatarRaw: unknown;
  }): Promise<
    { ok: true; profile: UserProfileView } | { ok: false; reason: "not_found" | "invalid_avatar" }
  > {
    if (typeof params.avatarRaw !== "string") {
      return { ok: false, reason: "invalid_avatar" };
    }
    const avatar = params.avatarRaw.trim().slice(0, 2048);
    if (!avatar) {
      return { ok: false, reason: "invalid_avatar" };
    }

    const existing = await prismaClient.user.findUnique({ where: { id: params.userId } });
    if (!existing) return { ok: false, reason: "not_found" };

    await prismaClient.user.update({
      where: { id: params.userId },
      data: { avatar, avatarManuallySet: true },
    });

    const profile = await userService.getOwnProfile(params.userId);
    if (!profile) return { ok: false, reason: "not_found" };
    return { ok: true, profile };
  },

  async createEmailChangeRequest(params: {
    userId: string;
    nextEmailRaw: string;
  }): Promise<{ ok: true; pendingEmail: string } | { ok: false; reason: "forbidden_google" | "invalid_email" }> {
    const profile = await prismaClient.user.findUnique({
      where: { id: params.userId },
      include: { authIdentities: true },
    });
    if (!profile) return { ok: false, reason: "invalid_email" };

    if (profile.authIdentities.some((identity) => identity.provider === AuthProvider.GOOGLE)) {
      return { ok: false, reason: "forbidden_google" };
    }

    const nextEmail = normalizeEmail(params.nextEmailRaw || "");
    if (!nextEmail || !isValidEmailFormat(nextEmail)) {
      return { ok: false, reason: "invalid_email" };
    }

    const token = tokenService.createRefreshToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + EMAIL_CHANGE_TTL_MS);
    const existingByEmail = await authRepository.findUserByEmail(nextEmail);
    const canSendEmails = !existingByEmail || existingByEmail.id === params.userId;

    await prismaClient.userEmailChangeRequest.upsert({
      where: { userId: params.userId },
      update: {
        oldEmail: profile.email,
        newEmail: nextEmail,
        tokenHash,
        expiresAt,
        createdAt: new Date(),
        consumedAt: null,
        invalidatedAt: null,
        sentAt: canSendEmails ? new Date() : null,
      },
      create: {
        userId: params.userId,
        oldEmail: profile.email,
        newEmail: nextEmail,
        tokenHash,
        expiresAt,
        sentAt: canSendEmails ? new Date() : null,
      },
    });

    if (canSendEmails) {
      const revertToken = tokenService.createRefreshToken();
      await prismaClient.emailChangeRevertToken.create({
        data: {
          userId: params.userId,
          tokenHash: hashToken(revertToken),
          restoreEmail: profile.email,
          changedToEmail: nextEmail,
          expiresAt: new Date(Date.now() + EMAIL_CHANGE_REVERT_TTL_MS),
        },
      });
      await mailService.sendEmail({
        to: nextEmail,
        ...buildEmailChangeVerificationEmail(token, profile.email),
      });
      await mailService.sendEmail({
        to: profile.email,
        ...buildEmailChangePreviousAddressAlert(nextEmail, revertToken),
      });
    }

    return { ok: true, pendingEmail: nextEmail };
  },

  async resendEmailChangeRequest(params: {
    userId: string;
    maybeNextEmailRaw?: string;
  }): Promise<{ ok: true; pendingEmail: string } | { ok: false; reason: "forbidden_google" | "invalid_email" | "missing_request" }> {
    if (params.maybeNextEmailRaw && params.maybeNextEmailRaw.trim()) {
      const next = await userService.createEmailChangeRequest({
        userId: params.userId,
        nextEmailRaw: params.maybeNextEmailRaw,
      });
      if (!next.ok) return next;
      return next;
    }

    const pending = await prismaClient.userEmailChangeRequest.findUnique({
      where: { userId: params.userId },
    });
    if (!pending || pending.consumedAt || pending.invalidatedAt || pending.expiresAt <= new Date()) {
      return { ok: false, reason: "missing_request" };
    }
    return userService.createEmailChangeRequest({
      userId: params.userId,
      nextEmailRaw: pending.newEmail,
    });
  },

  async verifyEmailChange(rawToken: string): Promise<
    { status: "verified" } | { status: "invalid" | "expired" }
  > {
    const tokenHash = hashToken(rawToken);
    const request = await prismaClient.userEmailChangeRequest.findUnique({
      where: { tokenHash },
    });
    if (!request) return { status: "invalid" };
    if (request.invalidatedAt || request.consumedAt) return { status: "invalid" };
    if (request.expiresAt <= new Date()) return { status: "expired" };

    const consumed = await prismaClient.userEmailChangeRequest.updateMany({
      where: {
        id: request.id,
        consumedAt: null,
        invalidatedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { consumedAt: new Date() },
    });
    if (consumed.count === 0) return { status: "invalid" };

    const occupied = await authRepository.findUserByEmail(request.newEmail);
    if (occupied && occupied.id !== request.userId) {
      return { status: "verified" };
    }

    await prismaClient.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: request.userId },
        data: { email: request.newEmail, emailVerifiedAt: new Date() },
      });
      await tx.userEmailChangeRequest.updateMany({
        where: { userId: request.userId, invalidatedAt: null },
        data: { invalidatedAt: new Date() },
      });
    });

    return { status: "verified" };
  },

  /** Read-only: what the revert link would undo. Opening the page must not change anything. */
  async previewEmailChangeRevert(rawToken: string): Promise<EmailChangeRevertPreview> {
    const token = await prismaClient.emailChangeRevertToken.findUnique({
      where: { tokenHash: hashToken(rawToken) },
    });
    const state = revertTokenState(token, new Date());
    if (state !== "valid" || !token) return { status: state === "valid" ? "invalid" : state };
    if (await isRestoreEmailClaimed(token)) return { status: "unavailable" };
    return { status: "valid", restoreEmail: token.restoreEmail, changedToEmail: token.changedToEmail };
  },

  /**
   * Undo an email change from the old-address alert: cancel or reverse it, sign out every session,
   * and replace the password with a fresh reset token (password accounts).
   */
  async revertEmailChange(rawToken: string, log?: FastifyBaseLogger): Promise<EmailChangeRevertResult> {
    const token = await prismaClient.emailChangeRevertToken.findUnique({
      where: { tokenHash: hashToken(rawToken) },
    });
    const now = new Date();
    const state = revertTokenState(token, now);
    if (state !== "valid" || !token) return { status: state === "valid" ? "invalid" : state };
    if (await isRestoreEmailClaimed(token)) return { status: "unavailable" };

    const claimed = await prismaClient.emailChangeRevertToken.updateMany({
      where: { id: token.id, usedAt: null, expiresAt: { gt: now } },
      data: { usedAt: now },
    });
    if (claimed.count === 0) return { status: "used" };

    const disabledPasswordHash = await hashPassword(randomBytes(32).toString("base64url"));
    const outcome = await applyEmailChangeRevert({
      userId: token.userId,
      restoreEmail: token.restoreEmail,
      disabledPasswordHash,
    });
    if (!outcome) return { status: "invalid" };

    await authRepository.revokeAllSessionsForUser(token.userId, "email_change_reverted");
    void recordDebugAuthLog(
      {
        source: "api",
        event: "sessions_revoked",
        reason: "email_change_reverted",
        message: "auth: all sessions revoked after email change revert",
        userId: token.userId,
        detail: { revokeReason: "email_change_reverted", emailTaken: outcome.emailTaken },
      },
      log,
    );

    return {
      status: outcome.emailTaken ? "email_taken" : "reverted",
      restoredEmail: token.restoreEmail,
      ...(outcome.passwordResetToken ? { passwordResetToken: outcome.passwordResetToken } : {}),
    };
  },

  async updateOwnConfiguration(params: {
    userId: string;
    payload: Record<string, unknown>;
  }): Promise<
    | { ok: true; configuration: UserConfigurationDto }
    | { ok: false; reason: "not_found" | "invalid_theme" | "invalid_language" | "invalid_celestial_slot" }
  > {
    const existing = await prismaClient.user.findUnique({ where: { id: params.userId }, select: { id: true } });
    if (!existing) return { ok: false, reason: "not_found" };

    const rawTheme = cleanText(params.payload.theme, 32);
    const rawLanguage = cleanText(params.payload.language, 16);
    const celestialSlot = parseCelestialSlot(params.payload.celestialSlot);

    if (rawTheme !== undefined && !SUPPORTED_THEMES.has(rawTheme)) {
      return { ok: false, reason: "invalid_theme" };
    }
    if (rawLanguage !== undefined && !SUPPORTED_LANGUAGES.has(rawLanguage)) {
      return { ok: false, reason: "invalid_language" };
    }
    if (celestialSlot === false) {
      return { ok: false, reason: "invalid_celestial_slot" };
    }

    if (rawTheme === undefined && rawLanguage === undefined && celestialSlot === undefined) {
      const current = await prismaClient.userConfiguration.findUnique({ where: { userId: params.userId } });
      return { ok: true, configuration: toConfigurationDto(current) };
    }

    const updated = await prismaClient.userConfiguration.upsert({
      where: { userId: params.userId },
      update: {
        ...(rawTheme !== undefined ? { theme: rawTheme } : {}),
        ...(rawLanguage !== undefined ? { language: rawLanguage } : {}),
        ...(celestialSlot !== undefined ? { celestialSlot } : {}),
      },
      create: {
        userId: params.userId,
        theme: rawTheme ?? "tokyo-dusk",
        language: rawLanguage ?? "en",
        celestialSlot: celestialSlot ?? null,
      },
    });

    return { ok: true, configuration: toConfigurationDto(updated) };
  },
};
