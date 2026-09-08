import axios from "axios";
import { createPendingPurchase, fetchCredits } from "./payments";

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
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });

  it("throws when the purchase API returns an error", async () => {
    mockedAxios.post.mockResolvedValue({
      data: { ok: false, error: "Unauthorized" },
    });

    await expect(createPendingPurchase()).rejects.toThrow("Unauthorized");
  });

  it("loads credits from the backend", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { ok: true, data: { credits: 12 } },
    });

    await expect(fetchCredits()).resolves.toEqual({ credits: 12 });
    expect(mockedAxios.get).toHaveBeenCalledWith("/payments/credits");
  });
});
