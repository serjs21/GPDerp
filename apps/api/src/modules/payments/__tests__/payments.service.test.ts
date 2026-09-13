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

import { EventName } from "@paddle/paddle-node-sdk";
import { paymentsService } from "../payments.service";

const { paymentsRepository } = jest.requireMock("../payments.repository") as {
  paymentsRepository: {
    createPendingPurchase: jest.Mock;
    findById: jest.Mock;
    getCredits: jest.Mock;
    fulfillCompletedPurchase: jest.Mock;
  };
};

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
    paymentsRepository.fulfillCompletedPurchase.mockResolvedValue("granted");

    const result = await paymentsService.handleVerifiedEvent(completedEvent());

    expect(result).toEqual({ status: "granted" });
    expect(paymentsRepository.fulfillCompletedPurchase).toHaveBeenCalledWith({
      purchaseReference,
      paddleTransactionId: "txn_1",
      paddleEventId: "evt_1",
    });
  });

  it("is a no-op when the same purchase is already fulfilled", async () => {
    paymentsRepository.fulfillCompletedPurchase.mockResolvedValue("duplicate");

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
  it("creates a pending purchase and returns the Paddle price id", async () => {
    paymentsRepository.createPendingPurchase.mockResolvedValue({
      id: purchaseReference,
      credits: 100,
    });

    await expect(paymentsService.createCheckout("user-1")).resolves.toEqual({
      purchaseReference,
      priceId: "pri_100_haiku",
      credits: 100,
    });
  });
});
