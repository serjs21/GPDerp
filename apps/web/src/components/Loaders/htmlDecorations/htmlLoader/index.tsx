// Server Component (no "use client") — pairs with MarkHydrated by reading html[data-hydrated="true"]
import { HtmlLoaderPage } from "./HtmlLoaderPage";
import styles from "./HtmlLoader.module.css";

/** Without JS nothing ever sets data-hydrated, so the loader would cover the server-rendered page forever. */
const NO_SCRIPT_HIDE_LOADER = "[data-html-loader]{display:none!important}";

/**
 * Full-viewport comic page shown until first reveal. Plain markup and CSS only (no client components),
 * so it paints from the initial HTML.
 */
export const HtmlLoader = () => {
  return (
    <>
      <noscript>
        <style>{NO_SCRIPT_HIDE_LOADER}</style>
      </noscript>
      <div className={styles.scene} data-html-loader>
        <HtmlLoaderPage />
      </div>
    </>
  );
};
