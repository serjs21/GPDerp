"use client";

import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { formatComicLabelText } from "@/components/ComicBurstLabel/formatComicLabelText";
import styles from "./ComicPageCtaAction.module.css";

const CTA_FILL = "#17131A";
const CTA_DISABLED_FILL = "#9e9e9e";
const CTA_FONT_SIZE = 22;
const CTA_PADDING_X = 48;
const CTA_PADDING_Y = 10;

export type ComicPageCtaActionProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
  fill?: string;
  textColor?: string;
  /** Use `submit` so Enter in ComicPageDialog fields activates this CTA. */
  type?: "button" | "submit";
  "aria-label"?: string;
};

/** Uniform comic burst CTA for `ComicPageDialog` `ctaFooter`. */
export function ComicPageCtaAction({
  label,
  onClick,
  disabled = false,
  busy = false,
  fill,
  textColor,
  type = "button",
  "aria-label": ariaLabel,
}: ComicPageCtaActionProps) {
  const canPress = !disabled && !busy;
  const burstFill = canPress ? (fill ?? CTA_FILL) : CTA_DISABLED_FILL;

  return (
    <button
      type={type}
      className={styles.action}
      disabled={!canPress}
      aria-busy={busy || undefined}
      aria-label={ariaLabel ?? label}
      onClick={(event) => {
        if (!canPress) return;
        // Avoid nesting accidental form submits when type=submit is inside a <form>.
        if (type === "submit") event.preventDefault();
        onClick();
      }}
    >
      <ComicBurstLabel
        className={styles.burst}
        text={formatComicLabelText(label)}
        fill={burstFill}
        textColor={textColor}
        shapeKind="rect"
        seed={`cta-${label}`}
        fontSize={CTA_FONT_SIZE}
        paddingX={CTA_PADDING_X}
        paddingY={CTA_PADDING_Y}
        strokeWidth={3}
      />
    </button>
  );
}
