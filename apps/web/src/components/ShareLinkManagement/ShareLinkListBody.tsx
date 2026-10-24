"use client";

import { FetchEmptyState } from "@/components/FetchEmptyState";
import { FetchingStaticLoader } from "@/components/Loaders/FetchingLoader";
import type { ShareLinkListBodyProps } from "./ShareLinkListBody.types";
import { ShareLinkManagementRow } from "./ShareLinkManagementRow";
import styles from "./ShareLinkManagement.module.css";

/** Centered loader while loading (kept over the hidden rows until they're ready), then rows or the empty state. */
export function ShareLinkListBody({
  showCenterLoader,
  revealed,
  showEmpty,
  showBottomLoader,
  items,
  getHaiku,
  onChanged,
  sentinelRef,
}: ShareLinkListBodyProps) {
  if (showCenterLoader) {
    return (
      <div className={styles.loaderRow}>
        <FetchingStaticLoader className={styles.initialFetch} />
      </div>
    );
  }

  return (
    <>
      {revealed ? null : (
        <div className={`${styles.loaderRow} ${styles.revealOverlay}`}>
          <FetchingStaticLoader className={styles.initialFetch} />
        </div>
      )}
      <div className={styles.listContent} data-revealed={revealed}>
        {showEmpty ? (
          <FetchEmptyState className={styles.emptyState} />
        ) : (
          items.map((link) => (
            <ShareLinkManagementRow
              key={link.id}
              link={link}
              haiku={getHaiku(link.sharedHaikuId)}
              onChanged={onChanged}
            />
          ))
        )}
        <div ref={sentinelRef} className={styles.sentinel} aria-hidden />
        {showBottomLoader ? (
          <div className={styles.loaderRow}>
            <FetchingStaticLoader className={styles.nextPageFetch} />
          </div>
        ) : null}
      </div>
    </>
  );
}
