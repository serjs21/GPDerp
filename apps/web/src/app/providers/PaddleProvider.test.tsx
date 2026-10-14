import { act, render } from "@testing-library/react";
import { PaddleProvider, usePaddle } from "./PaddleProvider";

const mockLoadPaddleSdk = jest.fn(() => Promise.resolve());
jest.mock("./loadPaddleSdk", () => ({ loadPaddleSdk: () => mockLoadPaddleSdk() }));

const mockInitializePaddle = jest.fn(() => Promise.resolve({ Checkout: { open: jest.fn() } }));
jest.mock("@paddle/paddle-js", () => ({
  CheckoutEventNames: { CHECKOUT_LOADED: "checkout.loaded", CHECKOUT_COMPLETED: "checkout.completed" },
  initializePaddle: () => mockInitializePaddle(),
}));

jest.mock("./paddleClientEnv", () => ({
  readPaddleClientEnv: () => ({ token: "test_token", environment: "sandbox", configured: true, priceId: "pri" }),
}));

const mockAuthState = { isLoggedIn: false };
jest.mock("./AuthenticationProvider", () => ({ useAuthenticationState: () => mockAuthState }));

type PaddleValue = ReturnType<typeof usePaddle>;
let latest: PaddleValue | null = null;
const capture = (value: PaddleValue) => {
  latest = value;
};
function Probe({ onValue }: { onValue: (value: PaddleValue) => void }) {
  onValue(usePaddle());
  return null;
}

describe("PaddleProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    latest = null;
  });

  it("does not download the SDK for guests and reports not initializing", async () => {
    mockAuthState.isLoggedIn = false;
    await act(async () => {
      render(
        <PaddleProvider>
          <Probe onValue={capture} />
        </PaddleProvider>,
      );
    });
    expect(mockLoadPaddleSdk).not.toHaveBeenCalled();
    expect(latest).toMatchObject({ paddle: null, ready: false, initializing: false, configured: true });
  });

  it("loads the SDK once the user is signed in", async () => {
    mockAuthState.isLoggedIn = true;
    await act(async () => {
      render(
        <PaddleProvider>
          <Probe onValue={capture} />
        </PaddleProvider>,
      );
    });
    expect(mockLoadPaddleSdk).toHaveBeenCalledTimes(1);
    expect(latest).toMatchObject({ ready: true, initializing: false });
  });
});
