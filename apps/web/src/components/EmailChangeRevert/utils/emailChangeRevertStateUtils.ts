import type { EmailChangeRevertPreview, EmailChangeRevertResult } from "@/api/emailChangeRevert";
import type { EmailChangeRevertViewState } from "../EmailChangeRevertView.types";

export function previewToViewState(preview: EmailChangeRevertPreview): EmailChangeRevertViewState {
  if (preview.status !== "valid") return { kind: preview.status };
  return { kind: "confirm", restoreEmail: preview.restoreEmail, changedToEmail: preview.changedToEmail, busy: false };
}

/** After a successful revert, password accounts go straight to choosing a new password. */
export function revertResultToViewState(result: EmailChangeRevertResult): EmailChangeRevertViewState {
  if (result.status !== "reverted" && result.status !== "email_taken") return { kind: result.status };
  const emailTaken = result.status === "email_taken";
  if (!result.passwordResetToken) {
    return { kind: "revertedNoPassword", restoredEmail: result.restoredEmail, emailTaken };
  }
  return { kind: "setPassword", restoredEmail: result.restoredEmail, emailTaken, busy: false, error: null };
}
