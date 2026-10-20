import axios from "axios";

type RevertTokenProblem = "invalid" | "expired" | "used";

export type EmailChangeRevertPreview =
  | { status: "valid"; restoreEmail: string; changedToEmail: string }
  | { status: RevertTokenProblem };

export type EmailChangeRevertResult =
  | { status: "reverted" | "email_taken"; restoredEmail: string; passwordResetToken?: string }
  | { status: RevertTokenProblem };

/** Read-only look at the revert link from the old-address alert (opening the page changes nothing). */
export async function fetchEmailChangeRevert(token: string): Promise<EmailChangeRevertPreview> {
  const { data } = await axios.get<{ ok: true; data: EmailChangeRevertPreview }>("/user/change-email/revert", {
    params: { token },
  });
  return data.data;
}

/** Undo the email change: restores the address, signs every session out, and disables the password. */
export async function confirmEmailChangeRevert(token: string): Promise<EmailChangeRevertResult> {
  const { data } = await axios.post<{ ok: true; data: EmailChangeRevertResult }>("/user/change-email/revert", {
    token,
  });
  return data.data;
}

/** Sets the new password with the single-use reset token the revert returned. */
export async function setPasswordAfterEmailChangeRevert(resetToken: string, password: string): Promise<void> {
  await axios.post("/auth/reset/confirm", { token: resetToken, password });
}
