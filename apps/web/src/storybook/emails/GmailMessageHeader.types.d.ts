import type { DevEmail } from "./devEmails";
import type { GmailViewport } from "./GmailMessageView.types";

export type GmailMessageHeaderProps = {
  email: Pick<DevEmail, "from" | "to" | "replyTo">;
  viewport: GmailViewport;
};
