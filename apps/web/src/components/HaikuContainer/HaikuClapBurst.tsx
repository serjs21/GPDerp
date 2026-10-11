"use client";

import { createPortal } from "react-dom";
import { HAIKU_ACTIONS_CLAP_SRC } from "./consts/haikuActionsConsts";
import type { HaikuClapBurstProps } from "./HaikuActions.types";
import { clapBurstClassName } from "./utils/haikuActionsUtils";
import styles from "./HaikuActions.module.css";

/** Fixed-position clap burst portaled to `document.body` (escapes lantern transforms). */
export function HaikuClapBurst({ position, fading }: HaikuClapBurstProps) {
  if (!position || typeof document === "undefined") return null;
  return createPortal(
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={HAIKU_ACTIONS_CLAP_SRC}
      alt=""
      className={clapBurstClassName(styles, fading)}
      style={{ top: position.top, left: position.left }}
      width={28}
      height={28}
      aria-hidden
    />,
    document.body,
  );
}
