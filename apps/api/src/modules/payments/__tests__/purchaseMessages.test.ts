import { noGenerationsLeftMessage, purchaseConfirmedMessage } from "../utils/purchaseMessages";

describe("purchaseMessages", () => {
  it("picks a no-generations-left message per purchase tier", () => {
    const zero = noGenerationsLeftMessage(0);
    const one = noGenerationsLeftMessage(1);
    const many = noGenerationsLeftMessage(2);
    expect(new Set([zero, one, many]).size).toBe(3);
    expect(noGenerationsLeftMessage(7)).toBe(many);
  });

  it("picks a purchase-confirmed message per purchase tier", () => {
    const first = purchaseConfirmedMessage(1);
    const second = purchaseConfirmedMessage(2);
    const many = purchaseConfirmedMessage(3);
    expect(new Set([first, second, many]).size).toBe(3);
    expect(purchaseConfirmedMessage(0)).toBe(first);
    expect(purchaseConfirmedMessage(9)).toBe(many);
  });
});
