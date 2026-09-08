jest.mock("../../../lib/prisma", () => ({
  prismaClient: {
    $transaction: jest.fn(),
    user: { findUnique: jest.fn() },
    generationPurchase: { create: jest.fn() },
  },
}));

import { GenerationPurchaseStatus } from "../../../generated/prisma";
import { paymentsRepository } from "../payments.repository";

const { prismaClient } = jest.requireMock("../../../lib/prisma") as {
  prismaClient: {
    $transaction: jest.Mock;
  };
};

const purchaseReference = "11111111-1111-4111-8111-111111111111";

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
