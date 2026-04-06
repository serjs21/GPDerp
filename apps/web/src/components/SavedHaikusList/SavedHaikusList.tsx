"use client";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "antd";
import { useCallback, useMemo, useRef } from "react";
import {
  fetchHaikusPage,
  haikuQueryKeys,
  HAIKU_LIST_PAGE_SIZE,
  type HaikuDto,
} from "@/api/haikus";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { HaikuContainer } from "@/components/HaikuContainer/HaikuContainer";
import { SakuraPetalLoader } from "@/components/Loaders";
import { useEndOfContentScroll } from "@/hooks/useEndOfContentScroll";
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
}: SavedHaikusListViewProps) {
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleEnd = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) onLoadMore();
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  useEndOfContentScroll(scrollRootRef, sentinelRef, handleEnd, {
    enabled: !isInitialLoading && !isError && haikus.length > 0 && hasNextPage,
  });

  return (
    <section className={styles.root} aria-label="Saved haikus">
      <h2 className={styles.heading}>Saved haikus</h2>

      {isInitialLoading ? (
        <div className={styles.loaderRow}>
          <SakuraPetalLoader />
        </div>
      ) : (
        <div ref={scrollRootRef} className={styles.scrollArea}>
          {haikus.length === 0 && !isError ? (
            <p className={styles.empty}>No saved haikus yet.</p>
          ) : (
            haikus.map((h) => (
              <HaikuContainer key={h.id} haiku={h} onDeleted={onHaikuDeleted} />
            ))
          )}
          <div ref={sentinelRef} className={styles.sentinel} aria-hidden />
          {isFetchingNextPage ? (
            <div className={styles.loaderRow}>
              <SakuraPetalLoader />
            </div>
          ) : null}
        </div>
      )}

      {isError ? (
        <div className={styles.footerActions}>
          <Button type="primary" onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : null}
    </section>
  );
}

export function SavedHaikusList() {
  const { isLoggedIn, initialized } = useAuthenticationState();
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: haikuQueryKeys.infiniteList(HAIKU_LIST_PAGE_SIZE),
    queryFn: ({ pageParam }) =>
      fetchHaikusPage({ offset: pageParam as number, pageSize: HAIKU_LIST_PAGE_SIZE }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { offset, haikus, total } = lastPage.data;
      const loaded = offset + haikus.length;
      return loaded < total ? loaded : undefined;
    },
    enabled: initialized && isLoggedIn,
  });

  const haikus = useMemo(
    () => query.data?.pages.flatMap((p) => p.data.haikus) ?? [],
    [query.data?.pages],
  );

  if (!initialized || !isLoggedIn) {
    return null;
  }

  return (
    <SavedHaikusListView
      haikus={haikus}
      isInitialLoading={query.isPending}
      isFetchingNextPage={query.isFetchingNextPage}
      isError={query.isError}
      hasNextPage={query.hasNextPage ?? false}
      onLoadMore={() => void query.fetchNextPage()}
      onRetry={() => void query.refetch()}
      onHaikuDeleted={() => void queryClient.invalidateQueries({ queryKey: haikuQueryKeys.all })}
    />
  );
}
