// Server Component (no "use client") — HtmlLoaderExit hides it via html[data-loader-exited="true"] once the app is revealed.
import { HtmlLoaderPage } from "./HtmlLoaderPage";
import styles from "./HtmlLoader.module.css";

/**
 * Full-viewport comic page shown until first reveal. Plain markup and CSS only (no client components),
 * so it paints from the initial HTML; on reveal HtmlLoaderExit turns it away like a comic page.
 */
export const HtmlLoader = () => {
  return (
    <div className={styles.scene} data-html-loader>
      <HtmlLoaderPage />
    </div>
  );
};
