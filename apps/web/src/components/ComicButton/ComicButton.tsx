"use client";

import { forwardRef, useCallback, useRef } from "react";
import { withDefaults } from "@/utils/props/withDefaults";
import { ComicBubbleStage } from "../ComicConfirmModal/ComicBubbleStage";
import type { ComicButtonProps } from "./ComicButton.types";
import {
  comicButtonAppearance,
  comicButtonStageClassName,
  comicButtonTargetsKey,
} from "./utils/comicButtonUtils";
import styles from "./ComicButton.module.css";

export type { ComicButtonMode, ComicButtonProps } from "./ComicButton.types";

const COMIC_BUTTON_DEFAULTS = {
  bubbleStyle: "speech",
  sourceDirection: "none",
  mode: "standalone",
  slot: "center",
  disabled: false,
  type: "button",
} as const;

export const ComicButton = forwardRef<HTMLButtonElement, ComicButtonProps>(function ComicButton(
  props,
  ref,
) {
  const { bubbleStyle, sourceDirection, mode, slot, disabled, type } = withDefaults(
    props,
    COMIC_BUTTON_DEFAULTS,
  );
  const { children, className, onClick, backgroundColors } = props;
  const stageRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const appearance = comicButtonAppearance(props.style, props.fontColor);

  const setButtonRef = (node: HTMLButtonElement | null) => {
    buttonRef.current = node;
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  const getTargets = useCallback(
    () => [
      {
        element: buttonRef.current,
        style: bubbleStyle,
        sourceDirection,
        backgroundColors,
      },
    ],
    [backgroundColors, bubbleStyle, sourceDirection],
  );

  if (mode === "embedded") {
    return (
      <button
        ref={setButtonRef}
        type={type}
        className={[styles.bubbleEmbedded, className].filter(Boolean).join(" ")}
        style={appearance.style}
        disabled={disabled}
        data-comic-role="cta"
        data-comic-slot={slot}
        data-bubble-style={bubbleStyle}
        data-source-direction={sourceDirection}
        onClick={onClick}
      >
        {children}
      </button>
    );
  }

  return (
    <ComicBubbleStage
      ref={stageRef}
      active
      targetsKey={comicButtonTargetsKey({
        bubbleStyle,
        sourceDirection,
        children,
        backgroundColors,
        color: appearance.color,
      })}
      getTargets={getTargets}
      className={comicButtonStageClassName(sourceDirection, className)}
    >
      <button
        ref={setButtonRef}
        type={type}
        className={styles.bubble}
        style={appearance.style}
        disabled={disabled}
        data-bubble-style={bubbleStyle}
        data-source-direction={sourceDirection}
        onClick={onClick}
      >
        {children}
      </button>
    </ComicBubbleStage>
  );
});
