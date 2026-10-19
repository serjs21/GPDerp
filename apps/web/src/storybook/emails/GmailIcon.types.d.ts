import type { GMAIL_ICON_PATHS } from "./consts/gmailPreviewConsts";

export type GmailIconName = keyof typeof GMAIL_ICON_PATHS;

export type GmailIconProps = {
  name: GmailIconName;
};
