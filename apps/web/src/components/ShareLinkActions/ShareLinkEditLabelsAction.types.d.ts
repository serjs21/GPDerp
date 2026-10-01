import type { ShareLinkActionButtonProps } from "./ShareLinkActionButton.types";

export type ShareLinkEditLabelsActionProps = {
  subject: string;
  disabled?: boolean;
  onEditLabels: () => void;
  captionClassName?: ShareLinkActionButtonProps["captionClassName"];
};
