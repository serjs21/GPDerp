"use client";

import type { CSSProperties, ReactNode } from "react";
import {
  getRotationBaseTransform,
  LANTERN_ROTATED_WIDTH_REM,
  type LanternRotatedVariantId,
} from "./consts/rotationBaseConsts";
import { LanternActionsDockProvider } from "./LanternActionsDockContext";
import styles from "./LanternRotated.module.css";
import { buildRotationBaseRootStyle } from "./utils/rotationBaseUtils";

export type LanternRotatedShellProps = {
  rotationBase: LanternRotatedVariantId;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  widthRem?: number;
  mirrored?: boolean;
  actionsBarOffsetX?: string;
  actionsBarOffsetY?: string;
  ariaLabel: string;
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
}: LanternRotatedShellProps) {
  const transform = getRotationBaseTransform(rotationBase);
  const rootStyle = buildRotationBaseRootStyle({
    widthRem,
    transform,
    actionsBarOffsetX,
    actionsBarOffsetY,
    style,
  });

  const rootClass = [styles.root, mirrored ? styles.mirrored : null, className]
    .filter(Boolean)
    .join(" ");
  const showFlame = transform.flameBottom != null || transform.flameHeight != null;

  return (
    <LanternActionsDockProvider>
      {(dockRef) => (
        <article className={rootClass} style={rootStyle} aria-label={ariaLabel}>
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
          <div className={styles.content}>{children}</div>
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
