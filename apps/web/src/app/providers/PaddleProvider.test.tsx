import { act, render } from "@testing-library/react";
import { PaddleProvider, usePaddle } from "./PaddleProvider";

const mockLoadPaddleSdk = jest.fn(() => Promise.resolve());
jest.mock("./loadPaddleSdk", () => ({ loadPaddleSdk: () => mockLoadPaddleSdk() }));

const mockInitializePaddle = jest.fn();
jest.mock("@paddle/paddle-js", () => ({
  CheckoutEventNames: { CHECKOUT_LOADED: "checkout.loaded", CHECKOUT_COMPLETED: "checkout.completed" },
  initializePaddle: () => mockInitializePaddle(),
}));

jest.mock("./paddleClientEnv", () => ({
  readPaddleClientEnv: () => ({ token: "test_token", environment: "sandbox", configured: true, priceId: "pri" }),
}));

type PaddleValue = ReturnType<typeof usePaddle>;
let latest: PaddleValue | null = null;
const capture = (value: PaddleValue) => {
  latest = value;
};
function Probe({ onValue }: { onValue: (value: PaddleValue) => void }) {
  onValue(usePaddle());
  return null;
}

async function renderProvider() {
  await act(async () => {
    render(
      <PaddleProvider>
        <Probe onValue={capture} />
      </PaddleProvider>,
    );
  });
  return latest!;
}

describe("PaddleProvider", () => {
  const instance = { Checkout: { open: jest.fn() } };

  beforeEach(() => {
    jest.clearAllMocks();
    latest = null;
    mockInitializePaddle.mockResolvedValue(instance);
  });

  it("does not download the SDK on mount", async () => {
    const value = await renderProvider();
    expect(mockLoadPaddleSdk).not.toHaveBeenCalled();
    expect(value.configured).toBe(true);
  });

  it("loads the SDK once on demand and reuses the instance", async () => {
    const value = await renderProvider();
    const [first, second] = await Promise.all([value.ensurePaddle(), value.ensurePaddle()]);
    expect(first).toBe(instance);
    expect(second).toBe(instance);
    expect(await value.ensurePaddle()).toBe(instance);
    expect(mockLoadPaddleSdk).toHaveBeenCalledTimes(1);
    expect(mockInitializePaddle).toHaveBeenCalledTimes(1);
  });

  it("resolves null on a failed load and retries on the next call", async () => {
    mockLoadPaddleSdk.mockRejectedValueOnce(new Error("blocked"));
    const value = await renderProvider();
    expect(await value.ensurePaddle()).toBeNull();
    expect(await value.ensurePaddle()).toBe(instance);
    expect(mockLoadPaddleSdk).toHaveBeenCalledTimes(2);
  });
});
