"use client";

import type { CSSProperties } from "react";
import type { HaikuContainerProps } from "@/components/HaikuContainer/HaikuContainer";
import { Lantern } from "./Lantern";
import {
  LANTERN_ROTATED_CONTENT_HEIGHT_PCT,
  LANTERN_ROTATED_CONTENT_WIDTH_PCT,
  LANTERN_ROTATED_WIDTH_REM,
  lanternRotatedContentTransform,
  type LanternRotatedVariantId,
} from "./lanternRotatedContent.config";
import styles from "./LanternRotated.module.css";

export type LanternRotatedProps = HaikuContainerProps & {
  variant?: LanternRotatedVariantId;
  className?: string;
  style?: CSSProperties;
  widthRem?: number;
  bodyOnly?: boolean;
  showActions?: boolean;
  onDelete?: () => Promise<void>;
  ariaLabel?: string;
};

/**
 * Alternative lantern display: rotated base PNG with haiku + actions
 * transformed to sit on the painted paper face (see lanternRotatedContent.config).
 */
export function LanternRotated(props: LanternRotatedProps) {
  const {
    variant = "rotated",
    className,
    style,
    widthRem = LANTERN_ROTATED_WIDTH_REM,
    bodyOnly,
    showActions = true,
    onDelete,
    ariaLabel,
    ...lanternProps
  } = props;

  const transform = lanternRotatedContentTransform(variant);
  const title =
    ariaLabel ??
    ("haiku" in lanternProps && lanternProps.haiku
      ? `Haiku lantern: ${lanternProps.haiku.title ?? ""}`
      : "generatingDraft" in lanternProps && lanternProps.generatingDraft
        ? `Generating haiku: ${lanternProps.generatingDraft.subject}`
        : "Rotated haiku lantern");

  const rootStyle = {
    "--lantern-rotated-width": `${widthRem}rem`,
    "--lantern-rotated-aspect": `${transform.imageWidth} / ${transform.imageHeight}`,
    "--lantern-rotated-content-left": `${transform.contentLeftPct}%`,
    "--lantern-rotated-content-top": `${transform.contentTopPct}%`,
    "--lantern-rotated-content-width": `${LANTERN_ROTATED_CONTENT_WIDTH_PCT}%`,
    "--lantern-rotated-content-height": `${LANTERN_ROTATED_CONTENT_HEIGHT_PCT}%`,
    "--lantern-rotated-content-scale": String(transform.contentScale),
    "--lantern-rotated-tilt": `${transform.rotateDeg}deg`,
    "--lantern-rotated-skew": `${transform.skewXDeg}deg`,
    ...(transform.flameBottom != null
      ? { "--lantern-rotated-flame-bottom": String(transform.flameBottom) }
      : {}),
    ...(transform.flameHeight != null
      ? { "--lantern-rotated-flame-height": String(transform.flameHeight) }
      : {}),
    ...style,
  } as CSSProperties;

  const rootClass = [styles.root, className].filter(Boolean).join(" ");
  const showFlame = transform.flameBottom != null || transform.flameHeight != null;

  return (
    <article className={rootClass} style={rootStyle} aria-label={title}>
      <div className={styles.shell} aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative lantern art from /public */}
        <img
          className={styles.image}
          src={transform.assetSrc}
          alt=""
          width={transform.imageWidth}
          height={transform.imageHeight}
          draggable={false}
          decoding="async"
        />
        {showFlame ? <span className={styles.flame} /> : null}
      </div>
      <div className={styles.content}>
        {"generatingDraft" in lanternProps && lanternProps.generatingDraft ? (
          <Lantern
            generatingDraft={lanternProps.generatingDraft}
            bodyOnly={bodyOnly}
            showActions={showActions}
          />
        ) : "haiku" in lanternProps && lanternProps.haiku ? (
          <Lantern
            haiku={lanternProps.haiku}
            bodyOnly={bodyOnly}
            showActions={showActions}
            onDelete={onDelete}
            onDeleted={lanternProps.onDeleted}
            onChanged={lanternProps.onChanged}
          />
        ) : null}
      </div>
    </article>
  );
}
