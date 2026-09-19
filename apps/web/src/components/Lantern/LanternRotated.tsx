"use client";

import type { CSSProperties } from "react";
import type { HaikuContainerProps } from "@/components/HaikuContainer/HaikuContainer";
import { Lantern } from "./Lantern";
import { LanternActionsDockProvider } from "./LanternActionsDockContext";
import {
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
  /** Flip horizontally so the painted face follows path direction. */
  mirrored?: boolean;
  bodyOnly?: boolean;
  showActions?: boolean;
  actionsAlwaysVisible?: boolean;
  /** Horizontal offset of the actions bar relative to lantern center. */
  actionsBarOffsetX?: string;
  /** Vertical gap between lantern bottom and actions bar. */
  actionsBarOffsetY?: string;
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
    mirrored = false,
    bodyOnly,
    showActions = true,
    actionsAlwaysVisible = false,
    actionsBarOffsetX,
    actionsBarOffsetY,
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
    "--lantern-rotated-content-width": `${transform.contentWidthPct}%`,
    "--lantern-rotated-content-height": `${transform.contentHeightPct}%`,
    "--lantern-rotated-content-scale": String(transform.contentScale),
    "--lantern-rotated-tilt": `${transform.rotateDeg}deg`,
    "--lantern-rotated-skew-x": `${transform.skewXDeg}deg`,
    "--lantern-rotated-skew-y": `${transform.skewYDeg}deg`,
    ...(transform.flameBottom != null
      ? { "--lantern-rotated-flame-bottom": String(transform.flameBottom) }
      : {}),
    ...(transform.flameHeight != null
      ? { "--lantern-rotated-flame-height": String(transform.flameHeight) }
      : {}),
    ...(actionsBarOffsetX != null
      ? { "--lantern-actions-bar-offset-x": actionsBarOffsetX }
      : {}),
    ...(actionsBarOffsetY != null
      ? { "--lantern-actions-bar-offset-y": actionsBarOffsetY }
      : {}),
    ...style,
  } as CSSProperties;

  const rootClass = [styles.root, mirrored ? styles.mirrored : null, className]
    .filter(Boolean)
    .join(" ");
  const showFlame = transform.flameBottom != null || transform.flameHeight != null;

  return (
    <LanternActionsDockProvider>
      {(dockRef) => (
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
                actionsAlwaysVisible={actionsAlwaysVisible}
              />
            ) : "haiku" in lanternProps && lanternProps.haiku ? (
              <Lantern
                haiku={lanternProps.haiku}
                bodyOnly={bodyOnly}
                showActions={showActions}
                actionsAlwaysVisible={actionsAlwaysVisible}
                onDelete={onDelete}
                onDeleted={lanternProps.onDeleted}
                onChanged={lanternProps.onChanged}
              />
            ) : null}
          </div>
          <div
            ref={dockRef}
            className={styles.actionsBarHost}
            data-lantern-actions-dock=""
          />
        </article>
      )}
    </LanternActionsDockProvider>
  );
}
