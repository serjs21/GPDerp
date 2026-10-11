"use client";

import type { RotationTableContentProps } from "./RotationTableContent.types";
import {
  rotationContentClassName,
  rotationContentStyle,
} from "./utils/rotationTableUtils";
import styles from "./RotationTable.module.css";

/** Rotated content wrap (when `applyTransform`) with the optional drag control on top. */
export function RotationTableContent({
  applyTransform,
  originRef,
  degrees,
  transformOrigin,
  contentClassName,
  control,
  children,
}: RotationTableContentProps) {
  return (
    <div
      ref={applyTransform ? originRef : undefined}
      className={rotationContentClassName(applyTransform, contentClassName)}
      style={rotationContentStyle(applyTransform, degrees, transformOrigin)}
    >
      {children}
      {control ? <div className={styles.control}>{control}</div> : null}
    </div>
  );
}
