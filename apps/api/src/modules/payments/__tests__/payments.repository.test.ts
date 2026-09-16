jest.mock("../../../lib/prisma", () => ({
  prismaClient: {
    $transaction: jest.fn(),
    user: { findUnique: jest.fn(), updateMany: jest.fn() },
    generationPurchase: { create: jest.fn(), findUnique: jest.fn() },
  },
}));

import { GenerationPurchaseStatus } from "../../../generated/prisma";
import { GENERATION_PACK_CREDITS, GENERATION_PACK_PRODUCT_KEY } from "../constants";
import { paymentsRepository } from "../payments.repository";

const { prismaClient } = jest.requireMock("../../../lib/prisma") as {
  prismaClient: {
    $transaction: jest.Mock;
    user: {
      findUnique: jest.Mock;
      updateMany: jest.Mock;
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
      user: {
        update: jest.fn().mockResolvedValue({}),
      },
    };
    prismaClient.$transaction.mockImplementation(async (cb: (inner: typeof tx) => Promise<unknown>) => cb(tx));

    const result = await paymentsRepository.fulfillCompletedPurchase({
      purchaseReference,
      paddleTransactionId: "txn_1",
      paddleEventId: "evt_1",
    });

    expect(result).toBe("granted");
    expect(tx.generationPurchase.updateMany).toHaveBeenCalledWith({
      where: { id: purchaseReference, status: GenerationPurchaseStatus.PENDING },
      data: {
        status: GenerationPurchaseStatus.COMPLETED,
        paddleTransactionId: "txn_1",
        paddleEventId: "evt_1",
        completedAt: expect.any(Date),
      },
    });
    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { generationCredits: { increment: 100 } },
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
      user: {
        update: jest.fn(),
      },
    };
    prismaClient.$transaction.mockImplementation(async (cb: (inner: typeof tx) => Promise<unknown>) => cb(tx));

    const result = await paymentsRepository.fulfillCompletedPurchase({
      purchaseReference,
      paddleTransactionId: "txn_1",
      paddleEventId: "evt_2",
    });

    expect(result).toBe("duplicate");
    expect(tx.generationPurchase.updateMany).not.toHaveBeenCalled();
    expect(tx.user.update).not.toHaveBeenCalled();
  });

  it("is idempotent when the Paddle event was already stored", async () => {
    const tx = {
      generationPurchase: {
        findUnique: jest.fn().mockResolvedValueOnce({ id: purchaseReference }),
        updateMany: jest.fn(),
      },
      user: {
        update: jest.fn(),
      },
    };
    prismaClient.$transaction.mockImplementation(async (cb: (inner: typeof tx) => Promise<unknown>) => cb(tx));

    const result = await paymentsRepository.fulfillCompletedPurchase({
      purchaseReference,
      paddleTransactionId: "txn_1",
      paddleEventId: "evt_1",
    });

    expect(result).toBe("duplicate");
    expect(tx.user.update).not.toHaveBeenCalled();
  });
});

describe("paymentsRepository.trySpendGenerationCredit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("decrements credits when the balance is sufficient", async () => {
    const tx = {
      user: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUnique: jest.fn().mockResolvedValue({ generationCredits: 99 }),
      },
    };
    prismaClient.$transaction.mockImplementation(async (cb: (inner: typeof tx) => Promise<unknown>) => cb(tx));

    await expect(paymentsRepository.trySpendGenerationCredit("user-1", 1)).resolves.toEqual({
      ok: true,
      creditsRemaining: 99,
    });
    expect(tx.user.updateMany).toHaveBeenCalledWith({
      where: { id: "user-1", generationCredits: { gte: 1 } },
      data: { generationCredits: { decrement: 1 } },
    });
  });

  it("returns insufficient when the balance is too low", async () => {
    const tx = {
      user: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        findUnique: jest.fn().mockResolvedValue({ id: "user-1" }),
      },
    };
    prismaClient.$transaction.mockImplementation(async (cb: (inner: typeof tx) => Promise<unknown>) => cb(tx));

    await expect(paymentsRepository.trySpendGenerationCredit("user-1", 1)).resolves.toEqual({
      ok: false,
      reason: "insufficient",
    });
  });

  it("returns not_found when the user does not exist", async () => {
    const tx = {
      user: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        findUnique: jest.fn().mockResolvedValue(null),
      },
    };
    prismaClient.$transaction.mockImplementation(async (cb: (inner: typeof tx) => Promise<unknown>) => cb(tx));

    await expect(paymentsRepository.trySpendGenerationCredit("missing", 1)).resolves.toEqual({
      ok: false,
      reason: "not_found",
    });
  });
});
