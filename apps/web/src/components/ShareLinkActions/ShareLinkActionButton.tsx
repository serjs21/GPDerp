"use client";

import { ComicPagePanel } from "@/components/ComicPageLayout";
import { ComicPressButton } from "@/components/ComicPressButton";
import { withDefaults } from "@/utils/props/withDefaults";
import type { ShareLinkActionButtonProps } from "./ShareLinkActionButton.types";
import { shareLinkActionPanelClassName } from "./utils/shareLinkActionClassUtils";
import {
  shareLinkActionAccentStyle,
  shareLinkActionHoverStyle,
  shareLinkActionLayoutStyle,
  shareLinkActionRowLayoutStyle,
} from "./utils/shareLinkActionStyleUtils";
import styles from "./ShareLinkActions.module.css";

const SHARE_LINK_ACTION_BUTTON_DEFAULTS = {
  background: "solid",
  isMotionBackground: false,
  shine: false,
  disabled: false,
  pressed: true,
  busy: false,
  inverted: false,
  invertCaptionOnHover: false,
} as const;

export function ShareLinkActionButton(props: ShareLinkActionButtonProps) {
  const {
    src,
    caption,
    captionClassName,
    className,
    ariaLabel,
    color,
    accentColor,
    hoverFill,
    background,
    isMotionBackground,
    shine,
    disabled,
    pressed,
    busy,
    inverted,
    invertCaptionOnHover,
  } = withDefaults(props, SHARE_LINK_ACTION_BUTTON_DEFAULTS);
  const { layout, rowLayout, onSelect } = props;
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
