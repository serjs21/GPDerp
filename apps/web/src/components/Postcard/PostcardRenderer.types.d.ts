import type { Ref } from "react";
import type { HaikuDto } from "@/api/haikus";
import type { PostcardTheme } from "./utils/postcardTheme";

export type PostcardRendererProps = {
  theme: PostcardTheme;
  haiku: HaikuDto;
  /** Multiplier on the base haiku font size (text still shrinks to fit). */
  fontScale?: number;
  className?: string;
  ref?: Ref<HTMLDivElement>;
};
