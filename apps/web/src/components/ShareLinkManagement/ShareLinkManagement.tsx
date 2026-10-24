"use client";

import { useRef } from "react";
import { ShareLinksSort } from "@/components/ShareLinksSort";
import { LIST_REVEAL_MAX_WAIT_MS } from "@/consts/visualReadiness/criticalAssets";
import { useEndOfContentScroll } from "@/hooks/useEndOfContentScroll";
import { useRenderedContentReveal } from "@/hooks/useRenderedContentReveal";
import { useShareLinks } from "@/hooks/useShareLinks";
import { useShareLinkSocket } from "@/hooks/useShareLinkSocket";
import { ShareLinkFilterPanels } from "./ShareLinkFilterPanels";
import { ShareLinkListBody } from "./ShareLinkListBody";
import { useShareLinkHaikuEnrichment } from "./useShareLinkHaikuEnrichment";
import { canLoadNextShareLinkPage, resolveShareLinkListFlags } from "./utils/shareLinkListUtils";
import styles from "./ShareLinkManagement.module.css";

export type ShareLinkManagementProps = {
  active?: boolean;
};

export function ShareLinkManagement({ active = true }: ShareLinkManagementProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const {
    query,
    items,
    filters,
    search,
    sort,
    updateSearchParams,
    onEnd,
  } = useShareLinks(active);

  useShareLinkSocket(active);

  const { getHaiku, isHaikuSettled } = useShareLinkHaikuEnrichment(items, active);
  const readyItems = items.filter((item) => isHaikuSettled(item.sharedHaikuId));

  const { showCenterLoader, showEmpty, showBottomLoader } = resolveShareLinkListFlags(
    query,
    items.length,
    readyItems.length,
  );
  const revealed = useRenderedContentReveal(scrollRef, {
    pending: showCenterLoader,
    maxWaitMs: LIST_REVEAL_MAX_WAIT_MS,
  });

  useEndOfContentScroll(scrollRef, sentinelRef, onEnd, {
    enabled: canLoadNextShareLinkPage(query, {
      active,
      revealed,
      allRowsReady: readyItems.length === items.length,
    }),
  });

  return (
    <div className={styles.root}>
      <div className={styles.controlsLeft}>
        <div className={styles.sortCell}>
          <ShareLinksSort
            value={sort}
            onChange={(next) => updateSearchParams({ sort: next })}
          />
        </div>
      </div>

      <div className={styles.filtersCell}>
        <ShareLinkFilterPanels
          selected={filters}
          onChange={(next) => updateSearchParams({ filters: next, search })}
        />
      </div>

      <div ref={scrollRef} className={styles.listShell} aria-busy={!revealed}>
        <ShareLinkListBody
          showCenterLoader={showCenterLoader}
          revealed={revealed}
          showEmpty={showEmpty}
          showBottomLoader={showBottomLoader}
          items={readyItems}
          getHaiku={getHaiku}
          onChanged={() => void query.refetch()}
          sentinelRef={sentinelRef}
        />
      </div>
    </div>
  );
}
