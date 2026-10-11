import type { ShareLinkLifecycleActionProps } from "./ShareLinkLifecycleAction.types";

export type ShareLinkStartButtonProps = Pick<ShareLinkLifecycleActionProps, "onStart" | "restartReason"> & {
  disabled: boolean;
};
