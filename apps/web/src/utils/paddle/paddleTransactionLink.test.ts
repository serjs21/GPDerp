import { hasPaddleTransactionLink } from "./paddleTransactionLink";

describe("hasPaddleTransactionLink", () => {
  it("detects Paddle payment links", () => {
    expect(hasPaddleTransactionLink("?_ptxn=txn_01m5pqv18djy4153whafkgcb74")).toBe(true);
    expect(hasPaddleTransactionLink("?lang=en&_ptxn=txn_01abc")).toBe(true);
  });

  it("ignores other or malformed parameters", () => {
    expect(hasPaddleTransactionLink("")).toBe(false);
    expect(hasPaddleTransactionLink("?txn=txn_01abc")).toBe(false);
    expect(hasPaddleTransactionLink("?_ptxn=ctm_01abc")).toBe(false);
  });
});
