"use client";

import { ComicPagePanel } from "@/components/ComicPageLayout";
import type { ShareLinkActionButtonProps } from "./ShareLinkActionButton.types";
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
    <ComicPagePanel
      selectable
      selected={pressed}
      loading={busy}
      background={background}
      color={color}
      flexWeight={1}
      contentAlign="start"
      isMotionBackground={isMotionBackground}
      shine={shine}
      className={[
        styles.action,
        inverted ? styles.inverted : "",
        invertCaptionOnHover ? styles.invertOnHover : "",
        disabled ? styles.disabled : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        ...shareLinkActionHoverStyle(hoverFill),
        ...shareLinkActionAccentStyle(accentColor),
        ...shareLinkActionLayoutStyle(layout),
        ...shareLinkActionRowLayoutStyle(rowLayout),
      }}
      ariaLabel={ariaLabel}
      onSelect={() => {
        if (disabled || busy) return;
        onSelect();
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
  );
}
