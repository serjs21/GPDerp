import type { CSSProperties } from "react";
import { buildRotatedSortClusterStyle } from "@/utils/sort/rotatedSortUtils";
import styles from "../ShareLinksSort.module.css";

const joinClasses = (...classes: Array<string | false | undefined>) => classes.filter(Boolean).join(" ");

/** Rotated (side panel) vs upright layout of the share-links sort panel and its coin cluster. */
export function shareLinksSortLayout(params: {
  rotated: boolean;
  coinSizeRem: number;
  className: string | undefined;
}): {
  titleDirection: "horizontal" | "vertical";
  panelClassName: string;
  clusterClassName: string;
  clusterStyle: CSSProperties | undefined;
} {
  const { rotated, coinSizeRem, className } = params;
  return {
    titleDirection: rotated ? "horizontal" : "vertical",
    panelClassName: joinClasses(styles.panel, rotated && styles.panelRotated, className),
    clusterClassName: joinClasses(styles.cluster, rotated && styles.clusterRotated),
    clusterStyle: rotated ? buildRotatedSortClusterStyle(coinSizeRem) : undefined,
  };
}
