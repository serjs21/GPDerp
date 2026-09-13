import { shouldApplyServerPreference } from "./tabState";

describe("shouldApplyServerPreference", () => {
  it("applies server value when client has no stored preference and server value is valid", () => {
    expect(
      shouldApplyServerPreference({ hasClientPreference: false, isValidServerValue: true }),
    ).toBe(true);
  });

  it("does not apply when client already chose a preference", () => {
    expect(
      shouldApplyServerPreference({ hasClientPreference: true, isValidServerValue: true }),
    ).toBe(false);
  });

  it("does not apply when server value is invalid", () => {
    expect(
      shouldApplyServerPreference({ hasClientPreference: false, isValidServerValue: false }),
    ).toBe(false);
  });
});
