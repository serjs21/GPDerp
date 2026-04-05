jest.mock("../../lib/prisma", () => ({
  prismaClient: {
    $transaction: jest.fn(),
  },
}));

import { authRepository } from "../repository";

const { prismaClient } = jest.requireMock("../../lib/prisma") as any;

describe("authRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates user, account, and ADMIN membership in createUserWithWorkspace", async () => {
    const tx = {
      user: {
        create: jest.fn().mockResolvedValue({ id: "user-1" }),
      },
      authIdentity: {
        create: jest.fn().mockResolvedValue({}),
      },
      passwordCredential: {
        create: jest.fn().mockResolvedValue({}),
      },
      account: {
        create: jest.fn().mockResolvedValue({ id: "account-1" }),
      },
      membership: {
        create: jest.fn().mockResolvedValue({}),
      },
    };
    prismaClient.$transaction.mockImplementation(async (cb: any) => cb(tx));

    await authRepository.createUserWithWorkspace({
      email: "user@example.com",
      userName: "user_example",
      firstName: "User",
      lastName: "Example",
      passwordHash: "hash",
      provider: "LOCAL" as any,
    });

    expect(tx.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: "user@example.com",
        userName: "user_example",
      }),
    });
    expect(tx.account.create).toHaveBeenCalledWith({
      data: {
        name: "User's Account",
        createdByUserId: "user-1",
      },
    });
    expect(tx.membership.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        accountId: "account-1",
        role: "ADMIN",
      },
    });
  });

  it("revokes only the affected session on refresh token reuse detection", async () => {
    const refreshUpdateMany = jest
      .fn()
      .mockResolvedValueOnce({ count: 0 })
      .mockResolvedValueOnce({ count: 1 });

    const tx = {
      refreshToken: {
        updateMany: refreshUpdateMany,
      },
      authSession: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    prismaClient.$transaction.mockImplementation(async (cb: any) => cb(tx));

    const result = await authRepository.rotateRefreshTokenAtomic({
      currentToken: {
        id: "rt-1",
        sessionId: "session-affected",
      } as any,
      nextTokenHash: "next-hash",
      nextExpiresAt: new Date(Date.now() + 1000 * 60),
    });

    expect(result).toEqual({ reused: true });
    expect(tx.authSession.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: "session-affected",
        }),
      }),
    );
    expect(tx.authSession.updateMany).not.toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: expect.not.stringMatching("session-affected"),
        }),
      }),
    );
  });
});
