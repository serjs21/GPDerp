import { act, renderHook, waitFor } from "@testing-library/react";
import { comicToast } from "@/components/ComicToast";
import { createCheckout, fetchCredits } from "@/api/payments";
import { openPaddleCheckoutWithFallback } from "@/app/providers/openPaddleCheckoutWithFallback";
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
  createCheckout: jest.fn(),
  fetchCredits: jest.fn(),
  confirmPurchase: jest.fn(),
}));

jest.mock("@/app/providers/openPaddleCheckoutWithFallback", () => ({
  openPaddleCheckoutWithFallback: jest.fn(async (open: (opts: unknown) => void, opts: unknown) => {
    open(opts);
    return "overlay";
  }),
  PADDLE_CHECKOUT_LOADED_EVENT: "paddle:checkout-loaded",
}));

const mockUsePaddle = jest.fn();
jest.mock("@/app/providers/PaddleProvider", () => ({
  PADDLE_CHECKOUT_COMPLETED_EVENT: "paddle:checkout-completed",
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

const mockedCreateCheckout = createCheckout as jest.MockedFunction<typeof createCheckout>;
const mockedFetchCredits = fetchCredits as jest.MockedFunction<typeof fetchCredits>;
const mockedComicToast = comicToast as jest.Mocked<typeof comicToast>;
const mockedOpenFallback = openPaddleCheckoutWithFallback as jest.MockedFunction<
  typeof openPaddleCheckoutWithFallback
>;

const purchaseId = "11111111-1111-4111-8111-111111111111";
const transactionId = "txn_100_haikus";
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
    mockedCreateCheckout.mockResolvedValue({
      purchaseId,
      transactionId,
      priceId,
      credits: 100,
    });
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

  it("opens overlay checkout with a server-created transaction id", async () => {
    const { result } = renderHook(() => useBuyGenerations());
    await waitFor(() => expect(result.current.loadingCredits).toBe(false));

    await act(async () => {
      await result.current.buy();
    });

    expect(mockRequestAuthentication).toHaveBeenCalledTimes(1);
    expect(mockedCreateCheckout).toHaveBeenCalledTimes(1);
    expect(mockedOpenFallback).toHaveBeenCalledTimes(1);
    expect(openCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        transactionId,
        customer: { email: "buyer@example.com" },
        settings: expect.objectContaining({
          displayMode: "overlay",
          successUrl: expect.stringContaining(`txn=${transactionId}`),
        }),
      }),
    );
  });

  it("opens the auth modal and does not create a purchase when logged out", async () => {
    mockRequestAuthentication.mockReturnValue(false);
    const { result } = renderHook(() => useBuyGenerations());
    await waitFor(() => expect(result.current.loadingCredits).toBe(false));

    await act(async () => {
      await result.current.buy();
    });

    expect(mockedCreateCheckout).not.toHaveBeenCalled();
    expect(mockedOpenFallback).not.toHaveBeenCalled();
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

    expect(mockedCreateCheckout).not.toHaveBeenCalled();
    expect(mockedOpenFallback).not.toHaveBeenCalled();
  });

  it("toasts when the checkout API fails", async () => {
    mockedCreateCheckout.mockRejectedValue(new Error("Unauthorized"));
    const { result } = renderHook(() => useBuyGenerations());
    await waitFor(() => expect(result.current.loadingCredits).toBe(false));

    await act(async () => {
      await result.current.buy();
    });

    expect(mockedOpenFallback).not.toHaveBeenCalled();
    expect(mockedComicToast.error).toHaveBeenCalledWith("error");
  });
});
