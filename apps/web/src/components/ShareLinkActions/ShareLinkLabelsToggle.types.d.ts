import type { ShareLinkActionButtonProps, ShareLinkActionLayout } from "./ShareLinkActionButton.types";
import type { ShareLinkActionsProps } from "./ShareLinkActions.types";

export type ShareLinkLabelsToggleProps = Pick<
  ShareLinkActionsProps,
  "subject" | "showLabels" | "togglingLabels" | "onToggleLabels"
> & {
  /** Overrides the actions-column placement (e.g. preview modal footer). */
  layouts?: { show: ShareLinkActionLayout; hide: ShareLinkActionLayout };
  /** Appended to the default caption class. */
  captionClassName?: ShareLinkActionButtonProps["captionClassName"];
};
