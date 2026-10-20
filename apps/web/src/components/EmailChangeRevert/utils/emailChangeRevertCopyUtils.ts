import type { EmailChangeRevertResultState } from "../EmailChangeRevertView.types";

/** `{email}` value for result copy; empty for states that are not about a restored address. */
export function resultEmail(state: EmailChangeRevertResultState): string {
  return "restoredEmail" in state ? state.restoredEmail : "";
}

/** The no-password finish uses its own copy when the old address could not be put back. */
export function resultBodyKey(state: EmailChangeRevertResultState, defaultKey: string): string {
  return state.kind === "revertedNoPassword" && state.emailTaken ? "emailTakenNoPasswordBody" : defaultKey;
}
