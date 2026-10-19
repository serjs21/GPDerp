import type { DevEmails } from "./devEmails";
import type { GmailBodyTab, GmailViewport } from "./GmailMessageView.types";

export type EmailStoryArgs = {
  /** `id` of an email returned by GET /dev/emails. */
  emailId: string;
  viewport: GmailViewport;
  tab: GmailBodyTab;
};

export type EmailStoryStageProps = EmailStoryArgs & {
  result: DevEmails | undefined;
};
