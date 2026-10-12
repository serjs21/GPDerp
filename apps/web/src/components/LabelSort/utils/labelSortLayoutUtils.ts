import type { CSSProperties } from "react";
import { buildRotatedSortClusterStyle } from "@/utils/sort/rotatedSortUtils";
import styles from "../LabelSort.module.css";

const joinClasses = (...classes: Array<string | false | undefined>) => classes.filter(Boolean).join(" ");

/**
 * Rotated (side panel) vs upright layout: horizontal title with the coin column sized to the measured
 * cluster width, or a vertical title with the default row.
 */
export function labelSortLayout(params: {
  rotated: boolean;
  coinSizeRem: number;
  className: string | undefined;
  clusterClassName: string | undefined;
  /** Cover art still decoding: keep the coins hidden so they never show as empty disks. */
  coversPending: boolean;
}): {
  titleDirection: "horizontal" | "vertical";
  panelClassName: string;
  clusterClassName: string;
  clusterStyle: CSSProperties | undefined;
} {
  const { rotated, coinSizeRem, className, clusterClassName, coversPending } = params;
  return {
    titleDirection: rotated ? "horizontal" : "vertical",
    panelClassName: joinClasses(styles.panel, rotated && styles.panelRotated, className),
    clusterClassName: joinClasses(
      styles.cluster,
      rotated && styles.clusterRotated,
      clusterClassName,
      coversPending && styles.clusterPending,
    ),
    clusterStyle: rotated ? buildRotatedSortClusterStyle(coinSizeRem) : undefined,
  };
}
