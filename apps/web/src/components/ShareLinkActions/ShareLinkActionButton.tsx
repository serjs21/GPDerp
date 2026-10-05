"use client";

import { ComicPagePanel } from "@/components/ComicPageLayout";
import { ComicPressButton } from "@/components/ComicPressButton";
import type { ShareLinkActionButtonProps } from "./ShareLinkActionButton.types";
import { shareLinkActionPanelClassName } from "./utils/shareLinkActionClassUtils";
import {
  shareLinkActionAccentStyle,
  shareLinkActionHoverStyle,
  shareLinkActionLayoutStyle,
  shareLinkActionRowLayoutStyle,
} from "./utils/shareLinkActionStyleUtils";
import styles from "./ShareLinkActions.module.css";

export function ShareLinkActionButton({
  src,
  caption,
  captionClassName,
  className,
  layout,
  rowLayout,
  ariaLabel,
  onSelect,
  color,
  background = "solid",
  isMotionBackground = false,
  shine = false,
  accentColor,
  hoverFill,
  disabled = false,
  pressed = true,
  busy = false,
  inverted = false,
  invertCaptionOnHover = false,
}: ShareLinkActionButtonProps) {
  return (
    <ComicPressButton
      className={styles.pressShell}
      aria-label={ariaLabel}
      aria-pressed={pressed}
      aria-busy={busy}
      disabled={disabled}
      onClick={() => {
        if (disabled || busy) return;
        onSelect();
      }}
    >
      <ComicPagePanel
        loading={busy}
        background={background}
        color={color}
        flexWeight={1}
        contentAlign="start"
        isMotionBackground={isMotionBackground}
        shine={shine}
        className={shareLinkActionPanelClassName({
          pressed,
          inverted,
          invertCaptionOnHover,
          disabled,
          className,
        })}
        style={{
          ...shareLinkActionHoverStyle(hoverFill),
          ...shareLinkActionAccentStyle(accentColor),
          ...shareLinkActionLayoutStyle(layout),
          ...shareLinkActionRowLayoutStyle(rowLayout),
        }}
      >
        <div className={styles.row}>
          {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
          <img className={styles.icon} src={src} alt="" draggable={false} decoding="async" />
          <span
            className={[styles.caption, captionClassName].filter(Boolean).join(" ")}
            aria-hidden
          >
            {caption}
          </span>
        </div>
      </ComicPagePanel>
    </ComicPressButton>
  );
}
