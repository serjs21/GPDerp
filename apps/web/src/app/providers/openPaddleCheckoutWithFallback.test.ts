import {
  openPaddleCheckoutWithFallback,
  PADDLE_CHECKOUT_LOADED_EVENT,
} from "./openPaddleCheckoutWithFallback";

describe("openPaddleCheckoutWithFallback", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    jest.useRealTimers();
  });

  it("keeps overlay mode when checkout.loaded fires", async () => {
    const open = jest.fn(() => {
      queueMicrotask(() => {
        window.dispatchEvent(new CustomEvent(PADDLE_CHECKOUT_LOADED_EVENT));
      });
    });
    const navigate = jest.fn();

    await expect(
      openPaddleCheckoutWithFallback(open, { transactionId: "txn_1" }, navigate),
    ).resolves.toBe("overlay");
    expect(navigate).not.toHaveBeenCalled();
  });

  it("falls back to top-level navigation when overlay never loads", async () => {
    jest.useFakeTimers();
    const open = jest.fn(() => {
      const iframe = document.createElement("iframe");
      iframe.src = "https://sandbox-buy.paddle.com/paddlejs/v2?source_page=http%3A%2F%2Flocalhost%3A3000";
      document.body.appendChild(iframe);
    });
    const navigate = jest.fn();

    const pending = openPaddleCheckoutWithFallback(open, { transactionId: "txn_1" }, navigate);
    await jest.advanceTimersByTimeAsync(2600);
    await expect(pending).resolves.toBe("top-level");
    expect(navigate).toHaveBeenCalledWith(
      expect.stringContaining("https://sandbox-buy.paddle.com/paddlejs/v2"),
    );
  });
});
