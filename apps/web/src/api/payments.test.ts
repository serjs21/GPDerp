import axios from "axios";
import { confirmPurchase, createCheckout, createPendingPurchase, fetchCredits } from "./payments";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("payments API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a pending purchase and returns purchaseId", async () => {
    mockedAxios.post.mockResolvedValue({
      data: { ok: true, data: { purchaseId: "11111111-1111-4111-8111-111111111111" } },
    });

    await expect(createPendingPurchase()).resolves.toEqual({
      purchaseId: "11111111-1111-4111-8111-111111111111",
    });
    expect(mockedAxios.post).toHaveBeenCalledWith("/payments/purchase");
  });

  it("creates a checkout with purchase and transaction ids", async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        ok: true,
        data: {
          purchaseReference: "11111111-1111-4111-8111-111111111111",
          transactionId: "txn_abc",
          priceId: "pri_100",
          credits: 100,
        },
      },
    });

    await expect(createCheckout()).resolves.toEqual({
      purchaseId: "11111111-1111-4111-8111-111111111111",
      transactionId: "txn_abc",
      priceId: "pri_100",
      credits: 100,
    });
    expect(mockedAxios.post).toHaveBeenCalledWith("/payments/checkout", {});
  });

  it("loads credits from the backend", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { ok: true, data: { credits: 12 } },
    });

    await expect(fetchCredits()).resolves.toEqual({ credits: 12 });
    expect(mockedAxios.get).toHaveBeenCalledWith("/payments/credits");
  });

  it("confirms a completed Paddle transaction", async () => {
    mockedAxios.post.mockResolvedValue({
      data: { ok: true, data: { credits: 112, status: "granted" } },
    });

    await expect(confirmPurchase("txn_abc")).resolves.toEqual({
      credits: 112,
      status: "granted",
    });
    expect(mockedAxios.post).toHaveBeenCalledWith("/payments/confirm", {
      transactionId: "txn_abc",
    });
  });
});
