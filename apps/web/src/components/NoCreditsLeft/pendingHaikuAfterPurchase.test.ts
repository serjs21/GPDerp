import { NO_CREDITS_LEFT_EVENT, PENDING_HAIKU_AFTER_PURCHASE_STORAGE_KEY } from "@/config/userConfiguration";
import { openNoCreditsLeft } from "./pendingHaikuAfterPurchase";

describe("openNoCreditsLeft", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("stores the subject and dispatches the no-credits event", () => {
    const listener = jest.fn();
    window.addEventListener(NO_CREDITS_LEFT_EVENT, listener);

    openNoCreditsLeft(" Morning mist ", "Out of ink");

    expect(window.localStorage.getItem(PENDING_HAIKU_AFTER_PURCHASE_STORAGE_KEY)).toBe("Morning mist");
    expect(listener).toHaveBeenCalledTimes(1);
    expect((listener.mock.calls[0][0] as CustomEvent).detail).toEqual({
      subject: " Morning mist ",
      message: "Out of ink",
    });
    window.removeEventListener(NO_CREDITS_LEFT_EVENT, listener);
  });
});
