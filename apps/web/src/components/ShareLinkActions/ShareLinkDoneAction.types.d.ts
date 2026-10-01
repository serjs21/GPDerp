import type { ShareLinkActionButtonProps } from "./ShareLinkActionButton.types";

export type ShareLinkDoneActionProps = {
  subject: string;
  onDone: () => void;
  captionClassName?: ShareLinkActionButtonProps["captionClassName"];
};
