import type { EmailChangeRevertViewProps, EmailChangeRevertViewState } from "./EmailChangeRevertView.types";

type SetPasswordState = Extract<EmailChangeRevertViewState, { kind: "setPassword" }>;

export type EmailChangeRevertPasswordStepProps = Pick<
  SetPasswordState,
  "restoredEmail" | "emailTaken" | "busy" | "error"
> &
  Pick<EmailChangeRevertViewProps, "onSubmitPassword">;
