import type { DevEmail } from "./devEmails";

export type GmailViewport = "desktop" | "mobile";
export type GmailBodyTab = "html" | "text";

export type GmailMessageViewProps = {
  email: DevEmail;
  /** Sanitized HTML body with inline images resolved. */
  bodyHtml: string;
  viewport: GmailViewport;
  defaultTab: GmailBodyTab;
};
