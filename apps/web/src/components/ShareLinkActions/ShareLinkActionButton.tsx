"use client";

import { ComicPagePanel } from "@/components/ComicPageLayout";
import type { ShareLinkActionButtonProps } from "./ShareLinkActionButton.types";
import {
  shareLinkActionHoverStyle,
  shareLinkActionLayoutStyle,
} from "./utils/shareLinkActionStyleUtils";
import styles from "./ShareLinkActions.module.css";

export function ShareLinkActionButton({
  src,
  caption,
  layout,
  ariaLabel,
  onSelect,
  color,
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
      background="solid"
      color={color}
      flexWeight={1}
      contentAlign="start"
      isMotionBackground={false}
      className={[
        styles.action,
        inverted ? styles.inverted : "",
        invertCaptionOnHover ? styles.invertOnHover : "",
        disabled ? styles.disabled : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ ...shareLinkActionHoverStyle(hoverFill), ...shareLinkActionLayoutStyle(layout) }}
      ariaLabel={ariaLabel}
      onSelect={() => {
        if (disabled || busy) return;
        onSelect();
      }}
    >
      <div className={styles.row}>
        {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
        <img className={styles.icon} src={src} alt="" draggable={false} decoding="async" />
        <span className={styles.caption} aria-hidden>
          {caption}
        </span>
      </div>
    </ComicPagePanel>
  );
}
