import { act, renderHook } from "@testing-library/react";
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
      isLoggedIn: true,
    });
    mockUsePaddle.mockReturnValue({
      paddle: { Checkout: { open: openCheckout } },
      ready: true,
      initializing: false,
      configured: true,
    });
  });

  it("does not fetch credits on mount", () => {
    renderHook(() => useBuyGenerations());
    expect(mockedFetchCredits).not.toHaveBeenCalled();
  });

  it("opens overlay checkout with a server-created transaction id", async () => {
    const { result } = renderHook(() => useBuyGenerations());

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
          successUrl: `${window.location.origin}/?txn=${transactionId}`,
        }),
      }),
    );
  });

  it("opens the auth modal and does not create a purchase when logged out", async () => {
    mockRequestAuthentication.mockReturnValue(false);
    const { result } = renderHook(() => useBuyGenerations());

    await act(async () => {
      await result.current.buy();
    });

    expect(mockedCreateCheckout).not.toHaveBeenCalled();
    expect(mockedOpenFallback).not.toHaveBeenCalled();
  });

  it("keeps Buy enabled for guests (no SDK loaded) so the click can prompt sign-in", async () => {
    mockUseAuthenticationState.mockReturnValue({ user: { email: "" }, isLoggedIn: false });
    mockUsePaddle.mockReturnValue({ paddle: null, ready: false, initializing: false, configured: true });
    mockRequestAuthentication.mockReturnValue(false);
    const { result } = renderHook(() => useBuyGenerations());
    expect(result.current.checkoutReady).toBe(true);

    await act(async () => {
      await result.current.buy();
    });

    expect(mockRequestAuthentication).toHaveBeenCalledTimes(1);
    expect(mockedCreateCheckout).not.toHaveBeenCalled();
  });

  it("is not checkout-ready for a signed-in user until the SDK has loaded", () => {
    mockUsePaddle.mockReturnValue({ paddle: null, ready: false, initializing: true, configured: true });
    const { result } = renderHook(() => useBuyGenerations());
    expect(result.current.checkoutReady).toBe(false);
  });

  it("does not open checkout when the price id is missing", async () => {
    mockReadPaddleClientEnv.mockReturnValue({
      token: "test_token",
      environment: "sandbox",
      priceId: null,
      configured: false,
    });
    const { result } = renderHook(() => useBuyGenerations());

    await act(async () => {
      await result.current.buy();
    });

    expect(mockedCreateCheckout).not.toHaveBeenCalled();
    expect(mockedOpenFallback).not.toHaveBeenCalled();
  });

  it("toasts when the checkout API fails", async () => {
    mockedCreateCheckout.mockRejectedValue(new Error("Unauthorized"));
    const { result } = renderHook(() => useBuyGenerations());

    await act(async () => {
      await result.current.buy();
    });

    expect(mockedOpenFallback).not.toHaveBeenCalled();
    expect(mockedComicToast.error).toHaveBeenCalledWith("error");
  });
});
