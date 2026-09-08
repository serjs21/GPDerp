import { act, renderHook, waitFor } from "@testing-library/react";
import { comicToast } from "@/components/ComicToast";
import { createPendingPurchase, fetchCredits } from "@/api/payments";
import { useBuyGenerations } from "./useBuyGenerations";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/components/ComicToast", () => ({
  comicToast: {
    error: jest.fn(),
    info: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("@/api/payments", () => ({
  createPendingPurchase: jest.fn(),
  fetchCredits: jest.fn(),
}));

const mockUsePaddle = jest.fn();
jest.mock("@/app/providers/PaddleProvider", () => ({
  usePaddle: () => mockUsePaddle(),
}));

const mockReadPaddleClientEnv = jest.fn();
jest.mock("@/app/providers/paddleClientEnv", () => ({
  readPaddleClientEnv: () => mockReadPaddleClientEnv(),
}));

const mockRequestAuthentication = jest.fn();
jest.mock("@/app/providers/AuthenticationVerificationProvider", () => ({
  useAuthenticationVerification: () => ({
    requestAuthentication: mockRequestAuthentication,
  }),
}));

const mockUseAuthenticationState = jest.fn();
jest.mock("@/app/providers/AuthenticationProvider", () => ({
  useAuthenticationState: () => mockUseAuthenticationState(),
}));

const mockedCreatePendingPurchase = createPendingPurchase as jest.MockedFunction<typeof createPendingPurchase>;
const mockedFetchCredits = fetchCredits as jest.MockedFunction<typeof fetchCredits>;
const mockedComicToast = comicToast as jest.Mocked<typeof comicToast>;

const purchaseId = "11111111-1111-4111-8111-111111111111";
const priceId = "pri_100_haikus";

const configuredEnv = {
  token: "test_token",
  environment: "sandbox" as const,
  priceId,
  configured: true,
};

describe("useBuyGenerations", () => {
  const openCheckout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedFetchCredits.mockResolvedValue({ credits: 4 });
    mockedCreatePendingPurchase.mockResolvedValue({ purchaseId });
    mockReadPaddleClientEnv.mockReturnValue(configuredEnv);
    mockRequestAuthentication.mockReturnValue(true);
    mockUseAuthenticationState.mockReturnValue({
      user: { email: "buyer@example.com" },
    });
    mockUsePaddle.mockReturnValue({
      paddle: { Checkout: { open: openCheckout } },
      ready: true,
      initializing: false,
      configured: true,
    });
  });

  it("opens checkout with purchaseId only after an authenticated purchase POST", async () => {
    const { result } = renderHook(() => useBuyGenerations());
    await waitFor(() => expect(result.current.loadingCredits).toBe(false));

    await act(async () => {
      await result.current.buy();
    });

    expect(mockRequestAuthentication).toHaveBeenCalledTimes(1);
    expect(mockedCreatePendingPurchase).toHaveBeenCalledTimes(1);
    expect(openCheckout).toHaveBeenCalledTimes(1);
    expect(openCheckout).toHaveBeenCalledWith({
      items: [{ priceId, quantity: 1 }],
      customData: { purchaseId },
      customer: { email: "buyer@example.com" },
      settings: { displayMode: "overlay" },
    });
    const opened = openCheckout.mock.calls[0][0] as { customData: Record<string, unknown> };
    expect(opened.customData).toEqual({ purchaseId });
    expect(opened.customData).not.toHaveProperty("userId");
  });

  it("opens the auth modal and does not create a purchase when logged out", async () => {
    mockRequestAuthentication.mockReturnValue(false);
    const { result } = renderHook(() => useBuyGenerations());
    await waitFor(() => expect(result.current.loadingCredits).toBe(false));

    await act(async () => {
      await result.current.buy();
    });

    expect(mockedCreatePendingPurchase).not.toHaveBeenCalled();
    expect(openCheckout).not.toHaveBeenCalled();
  });

  it("does not open checkout when the price id is missing", async () => {
    mockReadPaddleClientEnv.mockReturnValue({
      token: "test_token",
      environment: "sandbox",
      priceId: null,
      configured: false,
    });
    const { result } = renderHook(() => useBuyGenerations());
    await waitFor(() => expect(result.current.loadingCredits).toBe(false));

    await act(async () => {
      await result.current.buy();
    });

    expect(mockedCreatePendingPurchase).not.toHaveBeenCalled();
    expect(openCheckout).not.toHaveBeenCalled();
  });

  it("ignores a second click while checkout is starting", async () => {
    let resolvePurchase: ((value: { purchaseId: string }) => void) | undefined;
    mockedCreatePendingPurchase.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePurchase = resolve;
        }),
    );

    const { result } = renderHook(() => useBuyGenerations());
    await waitFor(() => expect(result.current.loadingCredits).toBe(false));

    let firstBuy: Promise<void> | undefined;
    act(() => {
      firstBuy = result.current.buy();
    });
    await waitFor(() => expect(result.current.startingCheckout).toBe(true));

    await act(async () => {
      await result.current.buy();
    });
    expect(mockedCreatePendingPurchase).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolvePurchase?.({ purchaseId });
      await firstBuy;
    });
    expect(openCheckout).toHaveBeenCalledTimes(1);
  });

  it("toasts when the purchase API fails", async () => {
    mockedCreatePendingPurchase.mockRejectedValue(new Error("Unauthorized"));
    const { result } = renderHook(() => useBuyGenerations());
    await waitFor(() => expect(result.current.loadingCredits).toBe(false));

    await act(async () => {
      await result.current.buy();
    });

    expect(openCheckout).not.toHaveBeenCalled();
    expect(mockedComicToast.error).toHaveBeenCalledWith("error");
  });

  it("omits customer when the session has no email", async () => {
    mockUseAuthenticationState.mockReturnValue({ user: { email: "  " } });
    const { result } = renderHook(() => useBuyGenerations());
    await waitFor(() => expect(result.current.loadingCredits).toBe(false));

    await act(async () => {
      await result.current.buy();
    });

    expect(openCheckout).toHaveBeenCalledWith({
      items: [{ priceId, quantity: 1 }],
      customData: { purchaseId },
      settings: { displayMode: "overlay" },
    });
  });
});
