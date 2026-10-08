import type { ShareLinkActionButtonProps } from "./ShareLinkActionButton.types";

export type ShareLinkGoToLinkActionProps = {
  subject: string;
  shareUrl: string;
  captionClassName?: ShareLinkActionButtonProps["captionClassName"];
  /** Defaults to SHARE_LINK_ACTION_LAYOUTS.followLink. */
  layout?: ShareLinkActionButtonProps["layout"];
  disabled?: ShareLinkActionButtonProps["disabled"];
};
