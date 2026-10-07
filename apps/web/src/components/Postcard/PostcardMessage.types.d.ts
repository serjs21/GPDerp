import type { Ref } from "react";

export type PostcardMessageProps = {
  message: string;
  senderName: string;
  className?: string;
  ref?: Ref<HTMLDivElement>;
};
