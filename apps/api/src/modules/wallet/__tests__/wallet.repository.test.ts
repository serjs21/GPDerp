jest.mock("../../../lib/prisma", () => ({
  prismaClient: {
    wallet: { findUnique: jest.fn() },
  },
}));

import type { Prisma } from "../../../generated/prisma";
import {
  createWalletWithTx,
  getGenerationCredits,
  grantGenerationCreditsWithTx,
  trySpendGenerationCreditsWithTx,
} from "../wallet.repository";

const { prismaClient } = jest.requireMock("../../../lib/prisma") as {
  prismaClient: { wallet: { findUnique: jest.Mock } };
};

const asTx = (tx: unknown) => tx as Prisma.TransactionClient;

describe("getGenerationCredits", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns the wallet balance", async () => {
    prismaClient.wallet.findUnique.mockResolvedValue({ generationCredits: 7 });
    await expect(getGenerationCredits("user-1")).resolves.toBe(7);
  });

  it("returns null when the user has no wallet", async () => {
    prismaClient.wallet.findUnique.mockResolvedValue(null);
    await expect(getGenerationCredits("user-1")).resolves.toBeNull();
  });
});

describe("trySpendGenerationCreditsWithTx", () => {
  it("decrements credits when the balance is sufficient", async () => {
    const tx = {
      wallet: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUnique: jest.fn().mockResolvedValue({ generationCredits: 99 }),
      },
    };

    await expect(trySpendGenerationCreditsWithTx(asTx(tx), "user-1", 1)).resolves.toEqual({
      ok: true,
      creditsRemaining: 99,
    });
    expect(tx.wallet.updateMany).toHaveBeenCalledWith({
      where: { userId: "user-1", generationCredits: { gte: 1 } },
      data: { generationCredits: { decrement: 1 } },
    });
  });

  it("returns insufficient when the balance is too low", async () => {
    const tx = {
      wallet: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        findUnique: jest.fn().mockResolvedValue({ generationCredits: 0 }),
      },
    };

    await expect(trySpendGenerationCreditsWithTx(asTx(tx), "user-1", 1)).resolves.toEqual({
      ok: false,
      reason: "insufficient",
    });
  });

  it("returns not_found when the user has no wallet", async () => {
    const tx = {
      wallet: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        findUnique: jest.fn().mockResolvedValue(null),
      },
    };

    await expect(trySpendGenerationCreditsWithTx(asTx(tx), "missing", 1)).resolves.toEqual({
      ok: false,
      reason: "not_found",
    });
  });

  it("rejects non-positive amounts", async () => {
    const tx = { wallet: { updateMany: jest.fn(), findUnique: jest.fn() } };
    await expect(trySpendGenerationCreditsWithTx(asTx(tx), "user-1", 0)).rejects.toThrow(
      "Credit amount must be a positive integer",
    );
    expect(tx.wallet.updateMany).not.toHaveBeenCalled();
  });
});

describe("grantGenerationCreditsWithTx", () => {
  it("increments the wallet (creating it if missing) and returns the new balance", async () => {
    const tx = { wallet: { upsert: jest.fn().mockResolvedValue({ generationCredits: 105 }) } };

    await expect(grantGenerationCreditsWithTx(asTx(tx), "user-1", 100)).resolves.toBe(105);
    expect(tx.wallet.upsert).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      create: { userId: "user-1", generationCredits: 100 },
      update: { generationCredits: { increment: 100 } },
      select: { generationCredits: true },
    });
  });
});

describe("createWalletWithTx", () => {
  it("creates the wallet with the initial credits", async () => {
    const tx = { wallet: { create: jest.fn().mockResolvedValue({}) } };

    await createWalletWithTx(asTx(tx), "user-1", 5);
    expect(tx.wallet.create).toHaveBeenCalledWith({ data: { userId: "user-1", generationCredits: 5 } });
  });
});
