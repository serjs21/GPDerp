"use client";

import { useEffect, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { usePageFlipCutout } from "@/hooks/usePageFlipCutout";
import { HTML_LOADER_FLIP_SETTINGS, HTML_LOADER_FLIP_UNCOVERED_SELECTOR } from "./consts/htmlLoaderFlipConsts";
import { HtmlLoaderPage } from "./HtmlLoaderPage";
import type { HtmlLoaderFlipBookHandle, HtmlLoaderPageFlipProps } from "./HtmlLoaderPageFlip.types";
import { prefersReducedMotion, viewportBookSize } from "./utils/htmlLoaderExitUtils";
import pageStyles from "./HtmlLoader.module.css";
import styles from "./HtmlLoaderPageFlip.module.css";

const BOOK_STYLE = {};

/**
 * Client-only (react-pageflip touches `document` on import; loaded with import() after hydration).
 * Re-renders the loader as the right page of a spread over the server-rendered loader, then turns it:
 * the loader stays on the page's front, its blank back curls over, and the app shows through the
 * uncovered corner (a transparent page, cut out of the loader by usePageFlipCutout).
 */
export function HtmlLoaderPageFlip({ onShown, onDone }: HtmlLoaderPageFlipProps) {
  const [size] = useState(viewportBookSize);
  const [reducedMotion] = useState(prefersReducedMotion);
  const bookRef = useRef<HtmlLoaderFlipBookHandle>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const startFrameRef = useRef(0);

  usePageFlipCutout(sceneRef, frontRef, HTML_LOADER_FLIP_UNCOVERED_SELECTOR);

  useEffect(() => {
    if (!reducedMotion) return;
    onShown();
    onDone();
  }, [reducedMotion, onShown, onDone]);

  useEffect(() => () => cancelAnimationFrame(startFrameRef.current), []);

  if (reducedMotion) return null;

  const handleInit = () => {
    onShown();
    // The engine times a turn from its last rendered frame (0 before its first one), so a turn started
    // straight from `init` can finish instantly or skip its start; begin once its frame loop is running.
    startFrameRef.current = requestAnimationFrame(() => {
      startFrameRef.current = requestAnimationFrame(() => bookRef.current?.pageFlip()?.flipNext("bottom"));
    });
  };

  return (
    <div ref={sceneRef} className={styles.scene} aria-hidden>
      <HTMLFlipBook
        ref={bookRef}
        {...HTML_LOADER_FLIP_SETTINGS}
        {...size}
        className={styles.book}
        style={BOOK_STYLE}
        onInit={handleInit}
        onFlip={onDone}
      >
        <div className={styles.blankPage} />
        <div>
          <div ref={frontRef} className={styles.pageContent}>
            <HtmlLoaderPage className={styles.pageContent} />
          </div>
        </div>
        <div>
          <div className={`${pageStyles.page} ${styles.pageContent}`}>
            <div className={pageStyles.pageInner} />
          </div>
        </div>
        <div className={styles.blankPage} data-flip-uncovered />
      </HTMLFlipBook>
    </div>
  );
}
