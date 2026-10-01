import type { ShareLinkActionButtonProps } from "./ShareLinkActionButton.types";

export type ShareLinkGoToLinkActionProps = {
  subject: string;
  shareUrl: string;
  captionClassName?: ShareLinkActionButtonProps["captionClassName"];
};
