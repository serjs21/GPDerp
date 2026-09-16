"use client";

import { Button } from "@/components/StyledComponents";
import { useCallback, useRef, type ComponentType, type RefObject } from "react";
import type { HaikuDto } from "@/api/haikus";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { HaikuContainer, type HaikuContainerProps } from "@/components/HaikuContainer/HaikuContainer";
import { SakuraPetalLoader } from "@/components/Loaders";
import { useEndOfContentScroll } from "@/hooks/useEndOfContentScroll";
import { useInfiniteHaikusQuery } from "@/hooks/useInfiniteHaikusQuery";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import styles from "./SavedHaikusList.module.css";

export type SavedHaikusListViewProps = {
  haikus: HaikuDto[];
  isInitialLoading: boolean;
  isFetchingNextPage: boolean;
  isError: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
  onHaikuDeleted?: () => void;
  /** In-flight generation row (same shell as saved items); cleared when WS sends `saved` or `complete`. */
  generatingDraft?: GeneratingDraft | null;
  /** When true, omits heading and inner scroll box; parent must supply `scrollRootRef` as the scrolling element. */
  embedded?: boolean;
  scrollRootRef?: RefObject<HTMLDivElement | null>;
  HaikuCardComponent?: ComponentType<HaikuContainerProps>;
  showEmptyMessage?: boolean;
  embeddedListClassName?: string;
};

export function SavedHaikusListView({
  haikus,
  isInitialLoading,
  isFetchingNextPage,
  isError,
  hasNextPage,
  onLoadMore,
  onRetry,
  onHaikuDeleted,
  generatingDraft = null,
  embedded = false,
  scrollRootRef: externalScrollRootRef,
  HaikuCardComponent = HaikuContainer,
  showEmptyMessage = true,
  embeddedListClassName,
}: SavedHaikusListViewProps) {
  const internalScrollRef = useRef<HTMLDivElement>(null);
  const scrollRootRef = externalScrollRootRef ?? internalScrollRef;
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleEnd = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) onLoadMore();
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  useEndOfContentScroll(scrollRootRef, sentinelRef, handleEnd, {
    enabled: !isInitialLoading && !isError && haikus.length > 0 && hasNextPage,
  });

  const listInner = (
    <>
      {generatingDraft ? (
        <HaikuCardComponent generatingDraft={generatingDraft} />
      ) : null}
      {showEmptyMessage && haikus.length === 0 && !isError && !generatingDraft ? (
        <p className={styles.empty}>No saved haikus yet.</p>
      ) : null}
      {haikus.map((h) => (
        <HaikuCardComponent key={h.id} haiku={h} onDeleted={onHaikuDeleted} onChanged={onHaikuDeleted} />
      ))}
      <div ref={sentinelRef} className={styles.sentinel} aria-hidden />
      {isFetchingNextPage ? (
        <div className={styles.loaderRow}>
          <SakuraPetalLoader />
        </div>
      ) : null}
    </>
  );

  const errorFooter = isError ? (
    <div className={styles.footerActions}>
      <Button type="primary" onClick={onRetry}>
        Try again
      </Button>
    </div>
  ) : null;

  if (embedded) {
    return (
      <div className={[styles.embedded, embeddedListClassName].filter(Boolean).join(" ")}>
        {isInitialLoading ? (
          <div className={styles.loaderRow}>
            <SakuraPetalLoader />
          </div>
        ) : (
          listInner
        )}
        {errorFooter}
      </div>
    );
  }

  return (
    <section className={styles.root} aria-label="Saved haikus">
      <h2 className={styles.heading}>Saved haikus</h2>

      {isInitialLoading ? (
        <div className={styles.loaderRow}>
          <SakuraPetalLoader />
        </div>
      ) : (
        <div ref={internalScrollRef} className={styles.scrollArea}>
          {listInner}
        </div>
      )}

      {errorFooter}
    </section>
  );
}

export type SavedHaikusListProps = {
  embedded?: boolean;
  scrollRootRef?: RefObject<HTMLDivElement | null>;
  generatingDraft?: GeneratingDraft | null;
  HaikuCardComponent?: ComponentType<HaikuContainerProps>;
  showEmptyMessage?: boolean;
  embeddedListClassName?: string;
};

export function SavedHaikusList({
  embedded,
  scrollRootRef,
  generatingDraft,
  HaikuCardComponent,
  showEmptyMessage,
  embeddedListClassName,
}: SavedHaikusListProps = {}) {
  const { initialized, isLoggedIn } = useAuthenticationState();
  const query = useInfiniteHaikusQuery();

  if (!initialized || !isLoggedIn) {
    return null;
  }

  return (
    <SavedHaikusListView
      haikus={query.haikus}
      isInitialLoading={query.isInitialLoading}
      isFetchingNextPage={query.isFetchingNextPage}
      isError={query.isError}
      hasNextPage={query.hasNextPage}
      onLoadMore={query.fetchNextPage}
      onRetry={query.refetch}
      onHaikuDeleted={query.invalidate}
      generatingDraft={generatingDraft}
      embedded={embedded}
      scrollRootRef={scrollRootRef}
      HaikuCardComponent={HaikuCardComponent}
      showEmptyMessage={showEmptyMessage}
      embeddedListClassName={embeddedListClassName}
    />
  );
}
