import type { CSSProperties } from "react";
import { buildRotatedSortClusterStyle } from "@/utils/sort/rotatedSortUtils";
import styles from "../ShareLinksSort.module.css";

const joinClasses = (...classes: Array<string | false | undefined>) => classes.filter(Boolean).join(" ");

/** Rotated (side panel) vs upright layout of the share-links sort panel and its coin cluster. */
export function shareLinksSortLayout(params: {
  rotated: boolean;
  coinSizeRem: number;
  className: string | undefined;
  /** Cover art still decoding: keep the coins hidden so they never show as empty disks. */
  coversPending: boolean;
}): {
  titleDirection: "horizontal" | "vertical";
  panelClassName: string;
  clusterClassName: string;
  clusterStyle: CSSProperties | undefined;
} {
  const { rotated, coinSizeRem, className, coversPending } = params;
  return {
    titleDirection: rotated ? "horizontal" : "vertical",
    panelClassName: joinClasses(styles.panel, rotated && styles.panelRotated, className),
    clusterClassName: joinClasses(
      styles.cluster,
      rotated && styles.clusterRotated,
      coversPending && styles.clusterPending,
    ),
    clusterStyle: rotated ? buildRotatedSortClusterStyle(coinSizeRem) : undefined,
  };
}
