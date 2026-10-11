import type { CSSProperties, ReactNode } from "react";
import type { ComicBubbleStyle } from "../ComicConfirmModal/comicBubblePresets";
import type { ComicSourceDirection } from "../ComicConfirmModal/comicSourceDirection";
import type { ComicPanelColor } from "../ComicPageLayout/comicPagePresets";

export type ComicButtonMode = "standalone" | "embedded";

export type ComicButtonProps = {
  children: ReactNode;
  bubbleStyle?: ComicBubbleStyle;
  /** Where the speech originates; `none` renders a tail-less bubble. */
  sourceDirection?: ComicSourceDirection;
  mode?: ComicButtonMode;
  /** Embedded modal CTA placement. */
  slot?: "start" | "end" | "center";
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  /** Comical bubble fill(s). */
  backgroundColors?: string[];
  /** Label color: panel token (e.g. `darkGreen`) or any CSS color. */
  fontColor?: ComicPanelColor | (string & {});
};
