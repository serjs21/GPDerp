"use client";

import { SakuraPetalLoader } from "@/components/Loaders";
import type { ManageLabelsLoaderRowProps } from "./ManageLabelsLoaderRow.types";
import styles from "./ManageLabelsPanel.module.css";

/** Centered first-page / next-page loader row; the sakura petal loader unless the panel passes its own. */
export function ManageLabelsLoaderRow({ loader }: ManageLabelsLoaderRowProps) {
  return <div className={styles.loaderRow}>{loader ?? <SakuraPetalLoader />}</div>;
}
