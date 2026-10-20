import type { EmailChangeRevertResultState } from "../EmailChangeRevertView.types";

/** Decorative card between the "keep" and "instead of" addresses on the confirm step. */
export const UNO_REVERSE_SRC = "/uno-reverse.svg";

/** Matches the API's password policy minimum (ResetPasswordModal uses the same check). */
export const EMAIL_CHANGE_REVERT_PASSWORD_MIN_LENGTH = 8;

type ResultCopy = {
  title: string;
  body: string;
  action: "signIn" | "home" | null;
  panelColor: "green" | "red" | "yellow" | "info";
};

/** Message keys (namespace `EmailChangeRevert`) and actions for the final / waiting states. */
export const EMAIL_CHANGE_REVERT_RESULT_COPY: Record<EmailChangeRevertResultState["kind"], ResultCopy> = {
  loading: { title: "loadingTitle", body: "loadingBody", action: null, panelColor: "info" },
  passwordSaved: { title: "passwordSavedTitle", body: "passwordSavedBody", action: "signIn", panelColor: "green" },
  revertedNoPassword: { title: "revertedTitle", body: "revertedBody", action: "signIn", panelColor: "green" },
  invalid: { title: "invalidTitle", body: "invalidBody", action: "home", panelColor: "red" },
  expired: { title: "expiredTitle", body: "expiredBody", action: "home", panelColor: "yellow" },
  used: { title: "usedTitle", body: "usedBody", action: "home", panelColor: "yellow" },
  failed: { title: "failedTitle", body: "failedBody", action: "home", panelColor: "red" },
};
