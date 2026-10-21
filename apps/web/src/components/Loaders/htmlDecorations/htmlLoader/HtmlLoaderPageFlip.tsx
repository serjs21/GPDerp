"use client";

import { useEffect, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { HTML_LOADER_FLIP_SETTINGS } from "./consts/htmlLoaderFlipConsts";
import { HtmlLoaderPage } from "./HtmlLoaderPage";
import type { HtmlLoaderFlipBookHandle, HtmlLoaderPageFlipProps } from "./HtmlLoaderPageFlip.types";
import { prefersReducedMotion, viewportBookSize } from "./utils/htmlLoaderExitUtils";
import styles from "./HtmlLoaderPageFlip.module.css";

const BOOK_STYLE = {};

/**
 * Client-only (react-pageflip touches `document` on import; loaded with import() after hydration).
 * Re-renders the loader page as a one-page book over the server-rendered loader, then turns it away
 * onto a transparent page so the app shows through.
 */
export function HtmlLoaderPageFlip({ onShown, onDone }: HtmlLoaderPageFlipProps) {
  const [size] = useState(viewportBookSize);
  const [reducedMotion] = useState(prefersReducedMotion);
  const bookRef = useRef<HtmlLoaderFlipBookHandle>(null);
  const originalContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!reducedMotion) return;
    onShown();
    onDone();
  }, [reducedMotion, onShown, onDone]);

  if (reducedMotion) return null;

  const handleInit = () => {
    onShown();
    bookRef.current?.pageFlip()?.flipNext("bottom");
    // In single-page mode the turning page is a copy (made synchronously by flipNext) and the original
    // stays drawn underneath; hide the original so the uncovered area shows the app, not the loader again.
    if (originalContentRef.current) originalContentRef.current.style.visibility = "hidden";
  };

  return (
    <div className={styles.scene} aria-hidden>
      <HTMLFlipBook
        ref={bookRef}
        {...HTML_LOADER_FLIP_SETTINGS}
        {...size}
        className={styles.book}
        style={BOOK_STYLE}
        onInit={handleInit}
        onFlip={onDone}
      >
        <div>
          <div ref={originalContentRef} className={styles.pageContent}>
            <HtmlLoaderPage className={styles.pageContent} />
          </div>
        </div>
        <div className={styles.blankPage} />
      </HTMLFlipBook>
    </div>
  );
}
