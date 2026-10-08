"use client";

import type { CSSProperties, ReactNode } from "react";
import { useTranslations } from "next-intl";
import { LabelHalo } from "@/components/LabelHalo/LabelHalo";
import type {
  LabelHaloLabelItem,
  LabelPlacement,
} from "@/components/LabelHalo/consts/labelHaloConsts";
import {
  getRotationBaseTransform,
  LANTERN_ROTATED_WIDTH_REM,
  type LanternRotatedVariantId,
} from "./consts/rotationBaseConsts";
import { LanternActionsDockProvider } from "./LanternActionsDockContext";
import styles from "./LanternRotated.module.css";
import { buildRotationBaseRootStyle } from "./utils/rotationBaseUtils";

export type LanternRotatedFaceHalo = {
  labels: LabelHaloLabelItem[];
  interactive?: boolean;
  onPlacementCommit?: (labelId: string, placement: LabelPlacement) => void;
  ariaLabel?: string;
};

export type LanternRotatedShellProps = {
  rotationBase: LanternRotatedVariantId;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  widthRem?: number;
  /** Flip the base PNG horizontally; face uses mirrored left + reverse skew (readable text). */
  mirrored?: boolean;
  actionsBarOffsetX?: string;
  actionsBarOffsetY?: string;
  ariaLabel: string;
  /**
   * When set, LabelHalo mounts on the paper-face plane so the drop grid
   * shares the same rotate/skew/scale as haiku content.
   */
  faceHalo?: LanternRotatedFaceHalo | null;
};

/**
 * Rotated base PNG shell with content transformed onto the painted paper face.
 */
export function LanternRotatedShell({
  rotationBase,
  children,
  className,
  style,
  widthRem = LANTERN_ROTATED_WIDTH_REM,
  mirrored = false,
  actionsBarOffsetX,
  actionsBarOffsetY,
  ariaLabel,
  faceHalo = null,
}: LanternRotatedShellProps) {
  const t = useTranslations("Lantern.lanternRotatedShell");
  const transform = getRotationBaseTransform(rotationBase);
  const rootStyle = buildRotationBaseRootStyle({
    widthRem,
    transform,
    mirrored,
    actionsBarOffsetX,
    actionsBarOffsetY,
    style,
  });

  const rootClass = [styles.root, className].filter(Boolean).join(" ");
  const shellClass = [styles.shell, mirrored ? styles.shellMirrored : null]
    .filter(Boolean)
    .join(" ");
  const showFlame = transform.flameBottom != null || transform.flameHeight != null;

  const showHalo =
    faceHalo != null &&
    (Boolean(faceHalo.interactive) || faceHalo.labels.length > 0);

  const faceBody = showHalo ? (
    <LabelHalo
      layout="fill"
      labels={faceHalo.labels}
      interactive={faceHalo.interactive ?? false}
      onPlacementCommit={faceHalo.onPlacementCommit}
      ariaLabel={faceHalo.ariaLabel ?? t("labels", { label: ariaLabel })}
    >
      <div className={styles.content}>{children}</div>
    </LabelHalo>
  ) : (
    <div className={styles.content}>{children}</div>
  );

  return (
    <LanternActionsDockProvider>
      {(dockRef) => (
        <article className={rootClass} style={rootStyle} aria-label={ariaLabel}>
          <div className={shellClass} aria-hidden>
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
          <div className={styles.face}>{faceBody}</div>
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
