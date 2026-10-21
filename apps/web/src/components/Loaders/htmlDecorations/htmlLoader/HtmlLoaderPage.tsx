// Server-safe (no "use client", no inline styles): rendered by the pre-hydration HtmlLoader.
import { GoldenAgeTitle } from "@/components/GoldenAgeTitle";
import { LANTERN_STATIC_TEXT_TIMING_CLASS, LanternStaticLoader } from "@/components/Loaders/LanternLoader";
import { LoadingText } from "@/components/Loaders/LoadingText";
import { WagTailStaticLoaderWithBackground } from "@/components/Loaders/WagTailLoader";
import type { HtmlLoaderPageProps } from "./HtmlLoaderPage.types";
import styles from "./HtmlLoader.module.css";

/** The loader's comic page: black-and-white masthead, swaying lantern on the left, wagging dog bottom right. */
export function HtmlLoaderPage({ className }: HtmlLoaderPageProps) {
  return (
    <div className={[styles.page, className].filter(Boolean).join(" ")}>
      <div className={styles.pageInner}>
        <div className={`${styles.panel} ${styles.titlePanel}`}>
          <div className={styles.titleSlot}>
            <GoldenAgeTitle className={styles.title} />
          </div>
        </div>
        <div className={styles.loaderRow}>
          <div className={`${styles.panel} ${styles.lanternPanel}`}>
            <LanternStaticLoader className={styles.lantern} />
          </div>
          <div className={`${styles.panel} ${styles.loaderPanel}`}>
            {/* Stands in for the lantern's caption when the lantern panel is hidden (small screens). */}
            <LoadingText className={`${styles.panelLoadingText} ${LANTERN_STATIC_TEXT_TIMING_CLASS}`} />
            <WagTailStaticLoaderWithBackground />
          </div>
        </div>
      </div>
    </div>
  );
}
