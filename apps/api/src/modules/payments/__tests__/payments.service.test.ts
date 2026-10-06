jest.mock("../../../env", () => ({
  env: {
    PADDLE_PRICE_ID_100_HAIKUS: "pri_100_haiku",
  },
}));

jest.mock("../payments.repository", () => ({
  paymentsRepository: {
    createPendingPurchase: jest.fn(),
    findById: jest.fn(),
    getCredits: jest.fn(),
    fulfillCompletedPurchase: jest.fn(),
  },
}));

jest.mock("../paddleWebhook", () => ({
  getPaddle: jest.fn(),
}));

import { EventName } from "@paddle/paddle-node-sdk";
import { getPaddle } from "../paddleWebhook";
import { paymentsService } from "../payments.service";

const { paymentsRepository } = jest.requireMock("../payments.repository") as {
  paymentsRepository: {
    createPendingPurchase: jest.Mock;
    findById: jest.Mock;
    getCredits: jest.Mock;
    fulfillCompletedPurchase: jest.Mock;
  };
};

const mockedGetPaddle = getPaddle as jest.MockedFunction<typeof getPaddle>;

const purchaseReference = "11111111-1111-4111-8111-111111111111";

const completedEvent = (overrides?: {
  eventType?: string;
  eventId?: string;
  transactionId?: string;
  customData?: Record<string, unknown> | null;
  priceId?: string | null;
}) =>
  ({
    eventType: overrides?.eventType ?? EventName.TransactionCompleted,
    eventId: overrides?.eventId ?? "evt_1",
    data: {
      id: overrides?.transactionId ?? "txn_1",
      customData: overrides?.customData === undefined ? { purchaseId: purchaseReference } : overrides.customData,
      items: [{ price: overrides?.priceId === null ? null : { id: overrides?.priceId ?? "pri_100_haiku" } }],
    },
  }) as never;

describe("paymentsService.handleVerifiedEvent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("grants credits for a matching transaction.completed event", async () => {
    paymentsRepository.fulfillCompletedPurchase.mockResolvedValue({
      status: "granted",
      userId: "user-1",
      credits: 140,
    });

    const result = await paymentsService.handleVerifiedEvent(completedEvent());

    expect(result).toEqual({ status: "granted", userId: "user-1", credits: 140 });
    expect(paymentsRepository.fulfillCompletedPurchase).toHaveBeenCalledWith({
      purchaseReference,
      paddleTransactionId: "txn_1",
      paddleEventId: "evt_1",
    });
  });

  it("is a no-op when the same purchase is already fulfilled", async () => {
    paymentsRepository.fulfillCompletedPurchase.mockResolvedValue({ status: "duplicate" });

    const result = await paymentsService.handleVerifiedEvent(completedEvent({ eventId: "evt_retry" }));

    expect(result).toEqual({ status: "duplicate" });
  });

  it("ignores events that are not transaction.completed", async () => {
    const result = await paymentsService.handleVerifiedEvent(
      completedEvent({ eventType: EventName.TransactionCreated }),
    );

    expect(result).toEqual({ status: "ignored" });
    expect(paymentsRepository.fulfillCompletedPurchase).not.toHaveBeenCalled();
  });

  it("does not grant credits when the price does not match", async () => {
    const result = await paymentsService.handleVerifiedEvent(completedEvent({ priceId: "pri_other" }));

    expect(result).toEqual({ status: "ignored", reason: "price_mismatch" });
    expect(paymentsRepository.fulfillCompletedPurchase).not.toHaveBeenCalled();
  });

  it("does not grant credits when purchaseId is missing", async () => {
    const result = await paymentsService.handleVerifiedEvent(completedEvent({ customData: {} }));

    expect(result).toEqual({ status: "ignored", reason: "missing_reference" });
    expect(paymentsRepository.fulfillCompletedPurchase).not.toHaveBeenCalled();
  });
});

describe("paymentsService.createPendingPurchaseForUser", () => {
  it("creates a pending purchase for the user", async () => {
    const row = { id: purchaseReference, userId: "user-1", credits: 100 };
    paymentsRepository.createPendingPurchase.mockResolvedValue(row);

    await expect(paymentsService.createPendingPurchaseForUser("user-1")).resolves.toEqual(row);
    expect(paymentsRepository.createPendingPurchase).toHaveBeenCalledWith("user-1");
  });
});

describe("paymentsService.findPurchaseByReference", () => {
  it("returns null for a non-uuid reference", async () => {
    await expect(paymentsService.findPurchaseByReference("not-a-uuid")).resolves.toBeNull();
    expect(paymentsRepository.findById).not.toHaveBeenCalled();
  });

  it("looks up a valid purchase reference", async () => {
    const row = { id: purchaseReference, userId: "user-1" };
    paymentsRepository.findById.mockResolvedValue(row);

    await expect(paymentsService.findPurchaseByReference(purchaseReference)).resolves.toEqual(row);
    expect(paymentsRepository.findById).toHaveBeenCalledWith(purchaseReference);
  });
});

describe("paymentsService.createCheckout", () => {
  it("creates a pending purchase and a Paddle transaction", async () => {
    paymentsRepository.createPendingPurchase.mockResolvedValue({
      id: purchaseReference,
      credits: 100,
    });
    mockedGetPaddle.mockReturnValue({
      transactions: {
        create: jest.fn().mockResolvedValue({ id: "txn_checkout_1" }),
      },
    } as never);

    await expect(paymentsService.createCheckout("user-1")).resolves.toEqual({
      purchaseReference,
      transactionId: "txn_checkout_1",
      priceId: "pri_100_haiku",
      credits: 100,
      checkoutUrl: null,
    });
  });
});

describe("paymentsService.confirmCompletedCheckout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("verifies the Paddle transaction and grants credits for the session user", async () => {
    mockedGetPaddle.mockReturnValue({
      transactions: {
        get: jest.fn().mockResolvedValue({
          id: "txn_abc",
          status: "completed",
          customData: { purchaseId: purchaseReference },
          items: [{ price: { id: "pri_100_haiku" } }],
        }),
      },
    } as never);
    paymentsRepository.findById.mockResolvedValue({
      id: purchaseReference,
      userId: "user-1",
      status: "PENDING",
    });
    paymentsRepository.fulfillCompletedPurchase.mockResolvedValue({
      status: "granted",
      userId: "user-1",
      credits: 140,
    });

    await expect(paymentsService.confirmCompletedCheckout("user-1", "txn_abc")).resolves.toEqual({
      ok: true,
      status: "granted",
      credits: 140,
      purchaseId: purchaseReference,
    });
    expect(paymentsRepository.fulfillCompletedPurchase).toHaveBeenCalledWith({
      purchaseReference,
      paddleTransactionId: "txn_abc",
      paddleEventId: "client-confirm:txn_abc",
    });
  });

  it("rejects when the purchase belongs to another user", async () => {
    mockedGetPaddle.mockReturnValue({
      transactions: {
        get: jest.fn().mockResolvedValue({
          id: "txn_abc",
          status: "completed",
          customData: { purchaseId: purchaseReference },
          items: [{ price: { id: "pri_100_haiku" } }],
        }),
      },
    } as never);
    paymentsRepository.findById.mockResolvedValue({
      id: purchaseReference,
      userId: "other-user",
      status: "PENDING",
    });

    await expect(paymentsService.confirmCompletedCheckout("user-1", "txn_abc")).resolves.toEqual({
      ok: false,
      reason: "not_found",
    });
    expect(paymentsRepository.fulfillCompletedPurchase).not.toHaveBeenCalled();
  });
});
