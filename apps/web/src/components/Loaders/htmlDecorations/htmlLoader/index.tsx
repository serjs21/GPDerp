// Server Component (no "use client") — pairs with MarkHydrated by reading html[data-hydrated="true"]
import { GoldenAgeTitle } from "@/components/GoldenAgeTitle";
import { LANTERN_LOADER_DEFAULTS, LanternLoader } from "@/components/Loaders/LanternLoader";
import { LoadingText } from "@/components/Loaders/LoadingText";
import { WagTailStaticLoaderWithBackground } from "@/components/Loaders/WagTailLoader";
import styles from "./HtmlLoader.module.css";

/**
 * Full-viewport comic page shown until first reveal: black-and-white masthead, swaying lantern on the
 * left, wagging dog bottom right. Plain markup and CSS only (no client components), so it paints from
 * the initial HTML.
 */
export const HtmlLoader = () => {
  return (
    <div className={styles.scene} data-html-loader>
      <div className={styles.page}>
        <div className={styles.pageInner}>
          <div className={`${styles.panel} ${styles.titlePanel}`}>
            <div className={styles.titleSlot}>
              <GoldenAgeTitle className={styles.title} />
            </div>
          </div>
          <div className={styles.loaderRow}>
            <div className={`${styles.panel} ${styles.lanternPanel}`}>
              <LanternLoader className={styles.lantern} />
            </div>
            <div className={`${styles.panel} ${styles.loaderPanel}`}>
              {/* Stands in for the lantern's caption when the lantern panel is hidden (small screens). */}
              <LoadingText className={styles.panelLoadingText} stepMs={LANTERN_LOADER_DEFAULTS.stepTransitionMs} />
              <WagTailStaticLoaderWithBackground />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
