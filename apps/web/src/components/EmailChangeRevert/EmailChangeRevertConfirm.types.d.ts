import type { EmailChangeRevertViewProps, EmailChangeRevertViewState } from "./EmailChangeRevertView.types";

type ConfirmState = Extract<EmailChangeRevertViewState, { kind: "confirm" }>;

export type EmailChangeRevertConfirmProps = Pick<ConfirmState, "restoreEmail" | "changedToEmail" | "busy"> &
  Pick<EmailChangeRevertViewProps, "onConfirm" | "onKeep">;
