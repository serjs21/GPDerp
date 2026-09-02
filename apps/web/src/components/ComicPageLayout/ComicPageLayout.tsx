"use client";

import type { ReactNode } from "react";
import {
  COMIC_PAGE_BORDER_PX,
  COMIC_PAGE_GUTTER_PX,
  COMIC_PAGE_INSET_PX,
} from "./comicPagePresets";
import styles from "./ComicPageLayout.module.css";

export type ComicPageLayoutProps = {
  children: ReactNode;
  title?: ReactNode;
  className?: string;
};

export function ComicPageLayout({ children, title, className }: ComicPageLayoutProps) {
  return (
    <div
      className={[styles.page, className].filter(Boolean).join(" ")}
      style={
        {
          "--comic-page-gutter": `${COMIC_PAGE_GUTTER_PX}px`,
          "--comic-page-border": `${COMIC_PAGE_BORDER_PX}px`,
          "--comic-page-inset": `${COMIC_PAGE_INSET_PX}px`,
        } as React.CSSProperties
      }
    >
      <div className={styles.pageInner}>
        {title ? <h2 className={styles.title}>{title}</h2> : null}
        {children}
      </div>
    </div>
  );
}
