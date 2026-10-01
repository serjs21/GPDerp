import type { ShareLinkActionsProps } from "./ShareLinkActions.types";

export type ShareLinkLabelsToggleProps = Pick<
  ShareLinkActionsProps,
  "subject" | "showLabels" | "togglingLabels" | "onToggleLabels"
>;
