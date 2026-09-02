"use client";

import * as Dialog from "@radix-ui/react-dialog";
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
  showClose?: boolean;
};

export function ComicPageLayout({ children, title, className, showClose = false }: ComicPageLayoutProps) {
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
        {showClose ? (
          <Dialog.Close asChild>
            <button type="button" className={styles.closeButton} aria-label="Close">
              ×
            </button>
          </Dialog.Close>
        ) : null}
        {title ? <h2 className={styles.title}>{title}</h2> : null}
        {children}
      </div>
    </div>
  );
}
