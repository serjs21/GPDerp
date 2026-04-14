import { AuthProvider } from "../../generated/prisma";
import { prismaClient } from "../../lib/prisma";
import { authRepository } from "../auth/repository";
import { hashToken, normalizeEmail } from "../auth/utils";
import { tokenService } from "../auth/tokenService";
import {
  buildEmailChangePreviousAddressAlert,
  buildEmailChangeVerificationEmail,
} from "../email/templates/authTemplates";
import { mailService } from "../email/mailService";

const EMAIL_CHANGE_TTL_MS = 24 * 60 * 60 * 1000;

const cleanText = (value: unknown, max = 200): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.slice(0, max);
};

const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export type UserProfileView = {
  id: string;
  email: string;
  userName: string;
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
};

export const userService = {
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
    };
  },

  async updateOwnProfile(params: {
    userId: string;
    payload: Record<string, unknown>;
  }): Promise<{ ok: true; profile: UserProfileView } | { ok: false }> {
    const existing = await prismaClient.user.findUnique({ where: { id: params.userId } });
    if (!existing) return { ok: false };

    const firstName = cleanText(params.payload.firstName, 120);
    const lastName = cleanText(params.payload.lastName, 120);
    const avatar = cleanText(params.payload.avatar, 2048);

    const data: {
      firstName?: string;
      lastName?: string;
      avatar?: string;
      avatarManuallySet?: boolean;
    } = {};
    if (firstName !== undefined) data.firstName = firstName;
    if (lastName !== undefined) data.lastName = lastName;
    if (avatar !== undefined) {
      data.avatar = avatar;
      data.avatarManuallySet = true;
    }

    if (Object.keys(data).length > 0) {
      await prismaClient.user.update({
        where: { id: params.userId },
        data,
      });
    }

    const profile = await userService.getOwnProfile(params.userId);
    if (!profile) return { ok: false };
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
    if (!nextEmail || !isValidEmail(nextEmail)) {
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
      await mailService.sendEmail({
        to: nextEmail,
        ...buildEmailChangeVerificationEmail(token, nextEmail),
      });
      await mailService.sendEmail({
        to: profile.email,
        ...buildEmailChangePreviousAddressAlert(nextEmail),
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
};
