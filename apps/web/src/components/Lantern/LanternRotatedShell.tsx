"use client";

import type { CSSProperties, ReactNode } from "react";
import type {
  LabelHaloLabelItem,
  LabelPlacement,
} from "@/components/LabelHalo/consts/labelHaloConsts";
import { withDefaults } from "@/utils/props/withDefaults";
import {
  getRotationBaseTransform,
  LANTERN_ROTATED_WIDTH_REM,
  type LanternRotatedVariantId,
} from "./consts/rotationBaseConsts";
import { LanternActionsDockProvider } from "./LanternActionsDockContext";
import { LanternRotatedBaseArt } from "./LanternRotatedBaseArt";
import { LanternRotatedFace } from "./LanternRotatedFace";
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

const LANTERN_ROTATED_SHELL_DEFAULTS = {
  widthRem: LANTERN_ROTATED_WIDTH_REM,
  mirrored: false,
};

/**
 * Rotated base PNG shell with content transformed onto the painted paper face.
 */
export function LanternRotatedShell(props: LanternRotatedShellProps) {
  const { rotationBase, className, widthRem, mirrored, actionsBarOffsetX, actionsBarOffsetY, ariaLabel } =
    withDefaults(props, LANTERN_ROTATED_SHELL_DEFAULTS);
  const transform = getRotationBaseTransform(rotationBase);
  const rootStyle = buildRotationBaseRootStyle({
    widthRem,
    transform,
    mirrored,
    actionsBarOffsetX,
    actionsBarOffsetY,
    style: props.style,
  });
  const rootClass = [styles.root, className].filter(Boolean).join(" ");

  return (
    <LanternActionsDockProvider>
      {(dockRef) => (
        <article className={rootClass} style={rootStyle} aria-label={ariaLabel}>
          <LanternRotatedBaseArt transform={transform} mirrored={mirrored} />
          <div className={styles.face}>
            <LanternRotatedFace faceHalo={props.faceHalo} ariaLabel={ariaLabel}>
              {props.children}
            </LanternRotatedFace>
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
