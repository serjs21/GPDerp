import type { Ref } from "react";
import type { PostcardTheme } from "./utils/postcardTheme";

export type PostcardMessageProps = {
  theme: PostcardTheme;
  message: string;
  senderName: string;
  recipients: string[];
  className?: string;
  ref?: Ref<HTMLDivElement>;
};
