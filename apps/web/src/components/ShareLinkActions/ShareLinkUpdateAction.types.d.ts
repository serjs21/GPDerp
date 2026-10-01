import type { ShareLinkActionsProps } from "./ShareLinkActions.types";

export type ShareLinkUpdateActionProps = Pick<
  ShareLinkActionsProps,
  "subject" | "active" | "canUpdate" | "updating" | "onUpdate"
>;
