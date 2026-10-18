jest.mock("../../../lib/prisma", () => ({
  prismaClient: {
    $transaction: jest.fn(),
    wallet: { findUnique: jest.fn() },
    generationPurchase: { create: jest.fn(), findUnique: jest.fn() },
  },
}));

import { GenerationPurchaseStatus } from "../../../generated/prisma";
import { GENERATION_PACK_CREDITS, GENERATION_PACK_PRODUCT_KEY } from "../constants";
import { paymentsRepository } from "../payments.repository";

const { prismaClient } = jest.requireMock("../../../lib/prisma") as {
  prismaClient: {
    $transaction: jest.Mock;
    wallet: {
      findUnique: jest.Mock;
    };
    generationPurchase: {
      create: jest.Mock;
      findUnique: jest.Mock;
    };
  };
};

const purchaseReference = "11111111-1111-4111-8111-111111111111";

describe("paymentsRepository.createPendingPurchase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("inserts a pending 100-credit pack for the user", async () => {
    const row = {
      id: purchaseReference,
      userId: "user-1",
      status: GenerationPurchaseStatus.PENDING,
      productKey: GENERATION_PACK_PRODUCT_KEY,
      credits: GENERATION_PACK_CREDITS,
      paddleTransactionId: null,
      paddleEventId: null,
      createdAt: new Date("2026-09-08T00:00:00.000Z"),
      completedAt: null,
    };
    prismaClient.generationPurchase.create.mockResolvedValue(row);

    await expect(paymentsRepository.createPendingPurchase("user-1")).resolves.toEqual(row);
    expect(prismaClient.generationPurchase.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        productKey: GENERATION_PACK_PRODUCT_KEY,
        credits: GENERATION_PACK_CREDITS,
        status: GenerationPurchaseStatus.PENDING,
      },
      select: expect.objectContaining({
        id: true,
        productKey: true,
        credits: true,
      }),
    });
  });
});

describe("paymentsRepository.findById", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the purchase when the reference exists", async () => {
    const row = { id: purchaseReference, userId: "user-1" };
    prismaClient.generationPurchase.findUnique.mockResolvedValue(row);

    await expect(paymentsRepository.findById(purchaseReference)).resolves.toEqual(row);
    expect(prismaClient.generationPurchase.findUnique).toHaveBeenCalledWith({
      where: { id: purchaseReference },
      select: expect.objectContaining({ id: true, userId: true }),
    });
  });

  it("returns null when the reference is missing", async () => {
    prismaClient.generationPurchase.findUnique.mockResolvedValue(null);
    await expect(paymentsRepository.findById(purchaseReference)).resolves.toBeNull();
  });
});

describe("paymentsRepository.fulfillCompletedPurchase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("atomically marks the purchase completed and increments credits", async () => {
    const tx = {
      generationPurchase: {
        findUnique: jest
          .fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce({
            id: purchaseReference,
            userId: "user-1",
            status: GenerationPurchaseStatus.PENDING,
            credits: 100,
          }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      wallet: {
        upsert: jest.fn().mockResolvedValue({ generationCredits: 199 }),
      },
    };
    prismaClient.$transaction.mockImplementation(async (cb: (inner: typeof tx) => Promise<unknown>) => cb(tx));

    const result = await paymentsRepository.fulfillCompletedPurchase({
      purchaseReference,
      paddleTransactionId: "txn_1",
      paddleEventId: "evt_1",
    });

    expect(result).toEqual({ status: "granted", userId: "user-1", credits: 199 });
    expect(tx.generationPurchase.updateMany).toHaveBeenCalledWith({
      where: { id: purchaseReference, status: GenerationPurchaseStatus.PENDING },
      data: {
        status: GenerationPurchaseStatus.COMPLETED,
        paddleTransactionId: "txn_1",
        paddleEventId: "evt_1",
        completedAt: expect.any(Date),
      },
    });
    expect(tx.wallet.upsert).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      create: { userId: "user-1", generationCredits: 100 },
      update: { generationCredits: { increment: 100 } },
      select: { generationCredits: true },
    });
  });

  it("does not increment credits when the purchase is already completed", async () => {
    const tx = {
      generationPurchase: {
        findUnique: jest
          .fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce({
            id: purchaseReference,
            userId: "user-1",
            status: GenerationPurchaseStatus.COMPLETED,
            credits: 100,
          }),
        updateMany: jest.fn(),
      },
      wallet: {
        upsert: jest.fn(),
      },
    };
    prismaClient.$transaction.mockImplementation(async (cb: (inner: typeof tx) => Promise<unknown>) => cb(tx));

    const result = await paymentsRepository.fulfillCompletedPurchase({
      purchaseReference,
      paddleTransactionId: "txn_1",
      paddleEventId: "evt_2",
    });

    expect(result).toEqual({ status: "duplicate" });
    expect(tx.generationPurchase.updateMany).not.toHaveBeenCalled();
    expect(tx.wallet.upsert).not.toHaveBeenCalled();
  });

  it("is idempotent when the Paddle event was already stored", async () => {
    const tx = {
      generationPurchase: {
        findUnique: jest.fn().mockResolvedValueOnce({ id: purchaseReference }),
        updateMany: jest.fn(),
      },
      wallet: {
        upsert: jest.fn(),
      },
    };
    prismaClient.$transaction.mockImplementation(async (cb: (inner: typeof tx) => Promise<unknown>) => cb(tx));

    const result = await paymentsRepository.fulfillCompletedPurchase({
      purchaseReference,
      paddleTransactionId: "txn_1",
      paddleEventId: "evt_1",
    });

    expect(result).toEqual({ status: "duplicate" });
    expect(tx.wallet.upsert).not.toHaveBeenCalled();
  });
});

describe("paymentsRepository wallet delegation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("reads the balance from the wallet", async () => {
    prismaClient.wallet.findUnique.mockResolvedValue({ generationCredits: 42 });
    await expect(paymentsRepository.getCredits("user-1")).resolves.toBe(42);
    expect(prismaClient.wallet.findUnique).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      select: { generationCredits: true },
    });
  });

  it("debits the wallet inside a transaction", async () => {
    const tx = {
      wallet: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUnique: jest.fn().mockResolvedValue({ generationCredits: 99 }),
      },
    };
    prismaClient.$transaction.mockImplementation(async (cb: (inner: typeof tx) => Promise<unknown>) => cb(tx));

    await expect(paymentsRepository.trySpendGenerationCredit("user-1", 1)).resolves.toEqual({
      ok: true,
      creditsRemaining: 99,
    });
    expect(tx.wallet.updateMany).toHaveBeenCalledWith({
      where: { userId: "user-1", generationCredits: { gte: 1 } },
      data: { generationCredits: { decrement: 1 } },
    });
  });
});
