import type { ShareLinkActionsProps } from "./ShareLinkActions.types";

export type ShareLinkPreviewLabelsActionsProps = Pick<
  ShareLinkActionsProps,
  "subject" | "showLabels" | "togglingLabels" | "onPreview" | "onToggleLabels" | "className"
> & {
  /** Disable both panels (e.g. no share link created yet). */
  disabled?: boolean;
};
