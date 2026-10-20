import type { EmailChangeRevertResultState, EmailChangeRevertViewProps } from "./EmailChangeRevertView.types";

export type EmailChangeRevertResultProps = {
  state: EmailChangeRevertResultState;
} & Pick<EmailChangeRevertViewProps, "onKeep" | "onSignIn">;
