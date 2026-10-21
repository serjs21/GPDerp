// Server Component (no "use client") — pairs with MarkHydrated by reading html[data-hydrated="true"]
import { HtmlLoaderPage } from "./HtmlLoaderPage";
import styles from "./HtmlLoader.module.css";

/**
 * Full-viewport comic page shown until first reveal. Plain markup and CSS only (no client components),
 * so it paints from the initial HTML.
 */
export const HtmlLoader = () => {
  return (
    <div className={styles.scene} data-html-loader>
      <HtmlLoaderPage />
    </div>
  );
};
