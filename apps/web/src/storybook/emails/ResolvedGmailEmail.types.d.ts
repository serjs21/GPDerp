import type { GmailMessageViewProps } from "./GmailMessageView.types";

export type ResolvedGmailEmailProps = Pick<GmailMessageViewProps, "email" | "viewport" | "defaultTab">;
