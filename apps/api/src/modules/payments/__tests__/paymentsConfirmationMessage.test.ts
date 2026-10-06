jest.mock("../../../env", () => ({
  env: {
    PADDLE_PRICE_ID_100_HAIKUS: "pri_100_haiku",
  },
}));

jest.mock("../payments.repository", () => ({
  paymentsRepository: {
    findConfirmationContext: jest.fn(),
    saveConfirmationMessage: jest.fn(),
  },
}));

jest.mock("../paddleWebhook", () => ({
  getPaddle: jest.fn(),
}));

jest.mock("../purchaseConfirmationAgent", () => ({
  generatePurchaseConfirmation: jest.fn(),
}));

import { PURCHASE_CONFIRMED_FALLBACK_MESSAGE, PURCHASE_MESSAGES } from "../constants";
import { generatePurchaseConfirmation } from "../purchaseConfirmationAgent";
import { paymentsService } from "../payments.service";

const { paymentsRepository } = jest.requireMock("../payments.repository") as {
  paymentsRepository: {
    findConfirmationContext: jest.Mock;
    saveConfirmationMessage: jest.Mock;
  };
};

const mockedGenerate = generatePurchaseConfirmation as jest.MockedFunction<
  typeof generatePurchaseConfirmation
>;

const purchaseId = "11111111-1111-4111-8111-111111111111";

describe("paymentsService.confirmationMessageFor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    paymentsRepository.saveConfirmationMessage.mockImplementation(
      async (_id: string, message: string) => message,
    );
  });

  it("returns an already-stored message without regenerating", async () => {
    paymentsRepository.findConfirmationContext.mockResolvedValue({
      confirmationMessage: "stored",
      ordinal: 0,
      previousMessage: null,
    });

    await expect(paymentsService.confirmationMessageFor(purchaseId)).resolves.toBe("stored");
    expect(paymentsRepository.saveConfirmationMessage).not.toHaveBeenCalled();
    expect(mockedGenerate).not.toHaveBeenCalled();
  });

  it("stores the written message for purchases within the sequence", async () => {
    paymentsRepository.findConfirmationContext.mockResolvedValue({
      confirmationMessage: null,
      ordinal: 5,
      previousMessage: null,
    });

    await expect(paymentsService.confirmationMessageFor(purchaseId)).resolves.toBe(
      PURCHASE_MESSAGES.purchaseConfirmed["4"],
    );
    expect(paymentsRepository.saveConfirmationMessage).toHaveBeenCalledWith(
      purchaseId,
      PURCHASE_MESSAGES.purchaseConfirmed["4"],
    );
    expect(mockedGenerate).not.toHaveBeenCalled();
  });

  it("generates from the previous stored message past the written sequence", async () => {
    paymentsRepository.findConfirmationContext.mockResolvedValue({
      confirmationMessage: null,
      ordinal: 21,
      previousMessage: "previous",
    });
    mockedGenerate.mockResolvedValue("generated");

    await expect(paymentsService.confirmationMessageFor(purchaseId)).resolves.toBe("generated");
    expect(mockedGenerate).toHaveBeenCalledWith("previous");
    expect(paymentsRepository.saveConfirmationMessage).toHaveBeenCalledWith(purchaseId, "generated");
  });

  it("seeds generation with the last written message when nothing earlier is stored", async () => {
    paymentsRepository.findConfirmationContext.mockResolvedValue({
      confirmationMessage: null,
      ordinal: 25,
      previousMessage: null,
    });
    mockedGenerate.mockResolvedValue("generated");

    await paymentsService.confirmationMessageFor(purchaseId);
    expect(mockedGenerate).toHaveBeenCalledWith(PURCHASE_MESSAGES.purchaseConfirmed["19"]);
  });

  it("stores and returns the fallback when generation fails", async () => {
    paymentsRepository.findConfirmationContext.mockResolvedValue({
      confirmationMessage: null,
      ordinal: 22,
      previousMessage: "previous",
    });
    const failure = new Error("model down");
    mockedGenerate.mockRejectedValue(failure);
    const onError = jest.fn();

    await expect(paymentsService.confirmationMessageFor(purchaseId, onError)).resolves.toBe(
      PURCHASE_CONFIRMED_FALLBACK_MESSAGE,
    );
    expect(onError).toHaveBeenCalledWith(failure);
    expect(paymentsRepository.saveConfirmationMessage).toHaveBeenCalledWith(
      purchaseId,
      PURCHASE_CONFIRMED_FALLBACK_MESSAGE,
    );
  });

  it("returns the fallback without storing when the purchase is not completed", async () => {
    paymentsRepository.findConfirmationContext.mockResolvedValue(null);

    await expect(paymentsService.confirmationMessageFor(purchaseId)).resolves.toBe(
      PURCHASE_CONFIRMED_FALLBACK_MESSAGE,
    );
    expect(paymentsRepository.saveConfirmationMessage).not.toHaveBeenCalled();
  });
});
