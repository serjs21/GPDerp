// Server Component (no "use client") — pairs with MarkHydrated by reading html[data-hydrated="true"]
import { GoldenAgeTitle } from "@/components/GoldenAgeTitle";
import { WagTailStaticLoaderWithBackground } from "@/components/Loaders/WagTailLoader";
import styles from "./HtmlLoader.module.css";

/**
 * Full-viewport comic page shown until first reveal: black-and-white masthead, wagging dog bottom right.
 * Plain markup and CSS only (no client components), so it paints from the initial HTML.
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
            <div className={`${styles.panel} ${styles.fillerPanel}`} />
            <div className={`${styles.panel} ${styles.loaderPanel}`}>
              <WagTailStaticLoaderWithBackground />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
