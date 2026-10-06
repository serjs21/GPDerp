import { PURCHASE_MESSAGES } from "../constants";
import {
  lastStaticPurchaseConfirmedMessage,
  noGenerationsLeftMessage,
  staticPurchaseConfirmedMessage,
} from "../utils/purchaseMessages";

describe("noGenerationsLeftMessage", () => {
  it("maps purchase counts 0-4 to the matching written message", () => {
    for (let count = 0; count <= 4; count += 1) {
      expect(noGenerationsLeftMessage(count)).toBe(PURCHASE_MESSAGES.noGenerationsLeft[String(count)]);
    }
  });

  it("keeps repeating the 5th message after that", () => {
    expect(noGenerationsLeftMessage(7)).toBe(PURCHASE_MESSAGES.noGenerationsLeft["4"]);
    expect(noGenerationsLeftMessage(100)).toBe(PURCHASE_MESSAGES.noGenerationsLeft["4"]);
  });

  it("treats negative counts as zero", () => {
    expect(noGenerationsLeftMessage(-1)).toBe(PURCHASE_MESSAGES.noGenerationsLeft["0"]);
  });
});

describe("staticPurchaseConfirmedMessage", () => {
  it("maps purchase ordinals 1-20 to the written sequence", () => {
    expect(staticPurchaseConfirmedMessage(1)).toBe(PURCHASE_MESSAGES.purchaseConfirmed["0"]);
    expect(staticPurchaseConfirmedMessage(20)).toBe(PURCHASE_MESSAGES.purchaseConfirmed["19"]);
  });

  it("returns null outside the written sequence", () => {
    expect(staticPurchaseConfirmedMessage(0)).toBeNull();
    expect(staticPurchaseConfirmedMessage(21)).toBeNull();
  });

  it("exposes the last written message", () => {
    expect(lastStaticPurchaseConfirmedMessage()).toBe(PURCHASE_MESSAGES.purchaseConfirmed["19"]);
  });
});
