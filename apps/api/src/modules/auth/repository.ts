import type {
  AuthProvider,
  EmailActionType,
  Prisma,
  RefreshToken,
} from "../../generated/prisma";
import { prismaClient } from "../../lib/prisma";

export const authRepository = {
  findUserByEmail(email: string) {
    return prismaClient.user.findUnique({
      where: { email },
      include: {
        passwordCredential: true,
        authIdentities: true,
      },
    });
  },

  findUserById(userId: string) {
    return prismaClient.user.findUnique({
      where: { id: userId },
      include: {
        authIdentities: true,
        memberships: {
          select: {
            id: true,
            userId: true,
            accountId: true,
            role: true,
            createdAt: true,
            account: {
              select: {
                id: true,
                name: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });
  },

  findUserByUserName(userName: string) {
    return prismaClient.user.findUnique({
      where: { userName },
    });
  },

  async createUserWithWorkspace(params: {
    email: string;
    userName: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    passwordHash?: string;
    provider: AuthProvider;
    providerAccountId?: string | null;
    emailVerifiedAt?: Date | null;
  }) {
    return prismaClient.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: params.email,
          userName: params.userName,
          firstName: params.firstName,
          lastName: params.lastName,
          avatar: params.avatar ?? "",
          emailVerifiedAt: params.emailVerifiedAt ?? null,
        },
      });

      await tx.authIdentity.create({
        data: {
          userId: user.id,
          provider: params.provider,
          providerAccountId: params.providerAccountId ?? null,
        },
      });

      if (params.passwordHash) {
        await tx.passwordCredential.create({
          data: {
            userId: user.id,
            passwordHash: params.passwordHash,
          },
        });
      }

      const account = await tx.account.create({
        data: {
          name: `${params.firstName || params.email}'s Account`,
          createdByUserId: user.id,
        },
      });

      await tx.membership.create({
        data: {
          userId: user.id,
          accountId: account.id,
          role: "ADMIN",
        },
      });

      return user;
    });
  },

  async attachManualAuth(params: { userId: string; passwordHash: string }) {
    await prismaClient.$transaction(async (tx) => {
      await tx.passwordCredential.upsert({
        where: { userId: params.userId },
        create: {
          userId: params.userId,
          passwordHash: params.passwordHash,
        },
        update: {
          passwordHash: params.passwordHash,
        },
      });
      await tx.authIdentity.upsert({
        where: {
          userId_provider: {
            userId: params.userId,
            provider: "LOCAL",
          },
        },
        create: {
          userId: params.userId,
          provider: "LOCAL",
        },
        update: {},
      });
    });
  },

  async attachGoogleIdentity(params: {
    userId: string;
    providerAccountId: string;
  }) {
    return prismaClient.authIdentity.upsert({
      where: {
        userId_provider: {
          userId: params.userId,
          provider: "GOOGLE",
        },
      },
      create: {
        userId: params.userId,
        provider: "GOOGLE",
        providerAccountId: params.providerAccountId,
      },
      update: {
        providerAccountId: params.providerAccountId,
      },
    });
  },

  findGoogleIdentityByProviderAccountId(providerAccountId: string) {
    return prismaClient.authIdentity.findUnique({
      where: {
        provider_providerAccountId: {
          provider: "GOOGLE",
          providerAccountId,
        },
      },
    });
  },

  createSession(params: {
    userId: string;
    ip?: string;
    userAgent?: string;
    expiresAt: Date;
  }) {
    return prismaClient.authSession.create({
      data: {
        userId: params.userId,
        ip: params.ip,
        userAgent: params.userAgent,
        expiresAt: params.expiresAt,
      },
    });
  },

  findActiveAuthSessionById(sessionId: string) {
    const now = new Date();
    return prismaClient.authSession.findUnique({
      where: { id: sessionId },
      select: { id: true, userId: true, expiresAt: true, revokedAt: true },
    }).then((session) => {
      if (!session) return null;
      if (session.revokedAt) return null;
      if (session.expiresAt <= now) return null;
      return session;
    });
  },

  createRefreshToken(params: {
    sessionId: string;
    tokenHash: string;
    expiresAt: Date;
    parentTokenId?: string;
  }) {
    return prismaClient.refreshToken.create({
      data: {
        sessionId: params.sessionId,
        tokenHash: params.tokenHash,
        expiresAt: params.expiresAt,
        parentTokenId: params.parentTokenId ?? null,
      },
    });
  },

  findRefreshTokenByHash(tokenHash: string) {
    return prismaClient.refreshToken.findUnique({
      where: { tokenHash },
      include: { session: true },
    });
  },

  revokeSession(sessionId: string, reason: string) {
    return prismaClient.$transaction(async (tx) => {
      await tx.authSession.updateMany({
        where: {
          id: sessionId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
          revokeReason: reason,
        },
      });
      await tx.refreshToken.updateMany({
        where: {
          sessionId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    });
  },

  rotateRefreshTokenAtomic(params: {
    currentToken: RefreshToken;
    nextTokenHash: string;
    nextExpiresAt: Date;
  }) {
    return prismaClient.$transaction(async (tx) => {
      const now = new Date();

      // Re-load inside the transaction to avoid relying on stale token/session state.
      const token = await tx.refreshToken.findUnique({
        where: { id: params.currentToken.id },
        include: { session: true },
      });

      if (!token) return { status: "invalid" } as const;
      if (token.session.revokedAt) return { status: "invalid" } as const;
      if (token.session.expiresAt <= now) return { status: "invalid" } as const;
      if (token.expiresAt <= now) return { status: "expired" } as const;

      // Try to consume the token exactly once.
      const consumeResult = await tx.refreshToken.updateMany({
        where: {
          id: token.id,
          consumedAt: null,
          revokedAt: null,
          expiresAt: { gt: now },
        },
        data: {
          consumedAt: now,
          // Ensure the previous refresh token cannot be used again.
          revokedAt: now,
        },
      });

      if (consumeResult.count === 0) {
        // Distinguish "expired" from "reused".
        const fresh = await tx.refreshToken.findUnique({
          where: { id: token.id },
          include: { session: true },
        });
        if (!fresh) return { status: "invalid" } as const;
        if (fresh.expiresAt <= now) return { status: "expired" } as const;
        if (fresh.session.revokedAt) return { status: "invalid" } as const;

        // Token was already consumed/revoked => likely theft/replay.
        await tx.refreshToken.updateMany({
          where: { id: fresh.id, reusedAt: null },
          data: { reusedAt: now },
        });

        await tx.authSession.updateMany({
          where: { id: fresh.sessionId, revokedAt: null },
          data: {
            revokedAt: now,
            revokeReason: "refresh_token_reuse_detected",
          },
        });

        await tx.refreshToken.updateMany({
          where: { sessionId: fresh.sessionId, revokedAt: null },
          data: { revokedAt: now },
        });

        return { status: "reused" } as const;
      }

      const nextToken = await tx.refreshToken.create({
        data: {
          sessionId: token.sessionId,
          tokenHash: params.nextTokenHash,
          expiresAt: params.nextExpiresAt,
          parentTokenId: token.id,
        },
      });

      await tx.refreshToken.update({
        where: { id: token.id },
        data: { replacedByTokenId: nextToken.id },
      });

      return { status: "ok", nextToken } as const;
    });
  },

  createEmailActionToken(params: {
    userId: string;
    type: EmailActionType;
    tokenHash: string;
    expiresAt: Date;
  }) {
    return prismaClient.emailActionToken.create({
      data: params,
    });
  },

  invalidateEmailActionTokens(params: { userId: string; type: EmailActionType }) {
    return prismaClient.emailActionToken.updateMany({
      where: {
        userId: params.userId,
        type: params.type,
        usedAt: null,
        invalidatedAt: null,
      },
      data: {
        invalidatedAt: new Date(),
      },
    });
  },

  consumeEmailActionToken(params: {
    type: EmailActionType;
    tokenHash: string;
  }) {
    return prismaClient.$transaction(async (tx) => {
      const token = await tx.emailActionToken.findUnique({
        where: { tokenHash: params.tokenHash },
      });

      if (!token || token.type !== params.type) return null;
      if (token.usedAt || token.invalidatedAt || token.expiresAt <= new Date()) return null;

      const updated = await tx.emailActionToken.update({
        where: { id: token.id },
        data: { usedAt: new Date() },
      });
      return updated;
    });
  },

  findEmailActionTokenByHash(tokenHash: string) {
    return prismaClient.emailActionToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            emailVerifiedAt: true,
          },
        },
      },
    });
  },

  markUserEmailVerified(userId: string) {
    return prismaClient.user.update({
      where: { id: userId },
      data: { emailVerifiedAt: new Date() },
    });
  },

  updateGoogleAvatarIfNotManual(userId: string, avatar: string) {
    return prismaClient.user.updateMany({
      where: {
        id: userId,
        avatarManuallySet: false,
      },
      data: {
        avatar,
      },
    });
  },

  updatePassword(userId: string, passwordHash: string) {
    return prismaClient.$transaction(async (tx) => {
      await tx.passwordCredential.upsert({
        where: { userId },
        create: { userId, passwordHash },
        update: { passwordHash },
      });
      await tx.authIdentity.upsert({
        where: {
          userId_provider: {
            userId,
            provider: "LOCAL",
          },
        },
        create: {
          userId,
          provider: "LOCAL",
        },
        update: {},
      });
    });
  },

  revokeAllSessionsForUser(userId: string, reason: string) {
    return prismaClient.$transaction(async (tx) => {
      const sessions = await tx.authSession.findMany({
        where: {
          userId,
          revokedAt: null,
        },
        select: { id: true },
      });
      const sessionIds = sessions.map((session) => session.id);
      if (sessionIds.length === 0) return;
      await tx.authSession.updateMany({
        where: {
          id: { in: sessionIds },
        },
        data: {
          revokedAt: new Date(),
          revokeReason: reason,
        },
      });
      await tx.refreshToken.updateMany({
        where: {
          sessionId: { in: sessionIds },
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    });
  },

  createUserEmailActionTokenTx(
    tx: Prisma.TransactionClient,
    params: { userId: string; type: EmailActionType; tokenHash: string; expiresAt: Date },
  ) {
    return tx.emailActionToken.create({ data: params });
  },

  recordFailedLoginAttempt(emailKey: string) {
    return prismaClient.failedLoginAttempt.create({
      data: { emailKey },
    });
  },

  countFailedLoginAttemptsSince(emailKey: string, since: Date) {
    return prismaClient.failedLoginAttempt.count({
      where: {
        emailKey,
        createdAt: { gte: since },
      },
    });
  },

  clearFailedLoginAttemptsForEmail(emailKey: string) {
    return prismaClient.failedLoginAttempt.deleteMany({
      where: { emailKey },
    });
  },

  async listAccountIdsForUser(userId: string) {
    const rows = await prismaClient.membership.findMany({
      where: { userId },
      select: { accountId: true },
    });
    return rows.map((r) => r.accountId);
  },

  /** Account this user created at signup, else first membership account (legacy rows). */
  async findDefaultWorkspaceAccountIdForUser(userId: string) {
    const owned = await prismaClient.account.findFirst({
      where: { createdByUserId: userId },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    if (owned) return owned.id;

    const membership = await prismaClient.membership.findFirst({
      where: {
        userId,
        role: { in: ["ADMIN", "OWNER"] },
      },
      orderBy: { createdAt: "asc" },
      select: { accountId: true },
    });
    return membership?.accountId ?? null;
  },

  async findAccountIdForUser(userId: string, preferredAccountId?: string | null) {
    if (preferredAccountId) {
      const membership = await prismaClient.membership.findUnique({
        where: {
          userId_accountId: { userId, accountId: preferredAccountId },
        },
        select: { accountId: true },
      });
      return membership?.accountId ?? null;
    }

    const membership = await prismaClient.membership.findFirst({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { accountId: true },
    });
    return membership?.accountId ?? null;
  },

  findMembershipRoleForAccount(userId: string, accountId: string) {
    return prismaClient.membership.findUnique({
      where: { userId_accountId: { userId, accountId } },
      select: { role: true },
    });
  },
};
