import type { Ref } from "react";

export type PostcardMessageProps = {
  message: string;
  senderName: string;
  /** Single addressee: every recipient gets their own back. */
  recipient: string;
  className?: string;
  ref?: Ref<HTMLDivElement>;
};
