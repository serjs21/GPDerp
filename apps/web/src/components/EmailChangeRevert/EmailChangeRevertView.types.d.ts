export type EmailChangeRevertProblem = "invalid" | "expired" | "used" | "unavailable" | "failed";

/**
 * Page states: `confirm.busy` is "reverting", `setPassword.busy` is "saving password";
 * `emailTaken` marks a revert that secured the account but could not restore the address.
 */
export type EmailChangeRevertViewState =
  | { kind: "loading" }
  | { kind: "confirm"; restoreEmail: string; changedToEmail: string; busy: boolean }
  | { kind: "setPassword"; restoredEmail: string; emailTaken: boolean; busy: boolean; error: string | null }
  | { kind: "passwordSaved"; restoredEmail: string }
  | { kind: "revertedNoPassword"; restoredEmail: string; emailTaken: boolean }
  | { kind: EmailChangeRevertProblem };

export type EmailChangeRevertResultState = Exclude<
  EmailChangeRevertViewState,
  { kind: "confirm" } | { kind: "setPassword" }
>;

export type EmailChangeRevertViewProps = {
  state: EmailChangeRevertViewState;
  onConfirm: () => void;
  /** "No, keep it" and the go-home actions. */
  onKeep: () => void;
  onSubmitPassword: (password: string) => void;
  onSignIn: () => void;
};
