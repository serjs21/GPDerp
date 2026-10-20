import { previewToViewState, revertResultToViewState } from "./emailChangeRevertStateUtils";

describe("previewToViewState", () => {
  it("asks for confirmation on a valid link", () => {
    expect(
      previewToViewState({ status: "valid", restoreEmail: "owner@example.com", changedToEmail: "new@example.com" }),
    ).toEqual({ kind: "confirm", restoreEmail: "owner@example.com", changedToEmail: "new@example.com", busy: false });
  });

  it.each(["invalid", "expired", "used"] as const)("shows the %s state", (status) => {
    expect(previewToViewState({ status })).toEqual({ kind: status });
  });
});

describe("revertResultToViewState", () => {
  it("moves password accounts to the new-password step", () => {
    expect(
      revertResultToViewState({ status: "reverted", restoredEmail: "owner@example.com", passwordResetToken: "t" }),
    ).toEqual({ kind: "setPassword", restoredEmail: "owner@example.com", emailTaken: false, busy: false, error: null });
  });

  it("keeps the email-taken warning on the password step", () => {
    expect(
      revertResultToViewState({ status: "email_taken", restoredEmail: "owner@example.com", passwordResetToken: "t" }),
    ).toMatchObject({ kind: "setPassword", emailTaken: true });
  });

  it("finishes directly for accounts without a password", () => {
    expect(revertResultToViewState({ status: "reverted", restoredEmail: "owner@example.com" })).toEqual({
      kind: "revertedNoPassword",
      restoredEmail: "owner@example.com",
      emailTaken: false,
    });
  });

  it("surfaces a link that was used in the meantime", () => {
    expect(revertResultToViewState({ status: "used" })).toEqual({ kind: "used" });
  });
});
