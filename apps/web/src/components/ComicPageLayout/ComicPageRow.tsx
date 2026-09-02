"use client";

import type { ReactNode } from "react";
import { parseRowColumns, type ComicPageRowColumns } from "./comicPagePresets";
import styles from "./ComicPageLayout.module.css";

export type ComicPageRowProps = {
  children: ReactNode;
  columns?: ComicPageRowColumns;
  className?: string;
};

export function ComicPageRow({ children, columns, className }: ComicPageRowProps) {
  if (!columns) {
    return (
      <div className={[styles.row, className].filter(Boolean).join(" ")}>{children}</div>
    );
  }

  const [left, right] = parseRowColumns(columns);

  return (
    <div
      className={[styles.row, styles.rowColumns, className].filter(Boolean).join(" ")}
      style={{ "--comic-row-left": left, "--comic-row-right": right } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
