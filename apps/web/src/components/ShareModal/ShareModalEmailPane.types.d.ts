import type { SendShareEmailContentProps } from "./SendShareEmailContent.types";
import type { ShareEmailSendPanelProps } from "./ShareEmailSendPanel.types";

export type ShareModalEmailPaneProps = {
  content: SendShareEmailContentProps;
  send: ShareEmailSendPanelProps;
};
