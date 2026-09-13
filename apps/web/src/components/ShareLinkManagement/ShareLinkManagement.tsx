"use client";

import { useRef } from "react";
import { ComicModalInput } from "@/components/ComicModalInput";
import { ComicPagePanel, ComicPageRow } from "@/components/ComicPageLayout";
import { SakuraPetalLoader } from "@/components/Loaders";
import { Select } from "@/components/StyledComponents";
import { useEndOfContentScroll } from "@/hooks/useEndOfContentScroll";
import { useShareLinks } from "@/hooks/useShareLinks";
import { ShareLinkManagementRow } from "./ShareLinkManagementRow";
import styles from "./ShareLinkManagement.module.css";

export type ShareLinkManagementProps = {
  active?: boolean;
};

export function ShareLinkManagement({ active = true }: ShareLinkManagementProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { query, items, filter, search, searchInput, setSearchInput, updateSearchParams, onEnd } =
    useShareLinks(active);

  useEndOfContentScroll(scrollRef, sentinelRef, onEnd, {
    enabled: Boolean(active && query.hasNextPage && !query.isFetchingNextPage),
  });

  return (
    <div className={styles.root}>
      <ComicPageRow className={styles.filtersRow}>
        <ComicPagePanel
          background="solid"
          color="white"
          title="Search"
          contentAlign="start"
          className={styles.filterPanel}
          flexWeight={1.4}
        >
          <form
            className={styles.searchForm}
            onSubmit={(e) => {
              e.preventDefault();
              updateSearchParams({ filter, search: searchInput });
            }}
          >
            <ComicModalInput
              placeholder="Search haiku subject"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search haiku subject"
            />
          </form>
        </ComicPagePanel>
        <ComicPagePanel
          background="halftone"
          color="blue"
          title="Filter"
          contentAlign="start"
          className={styles.filterPanel}
          flexWeight={0.9}
        >
          <div className={styles.filterControl}>
            <Select
              allowClear
              placeholder="All"
              value={filter}
              onChange={(value) => updateSearchParams({ filter: value, search })}
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
                { value: "expired", label: "Expired" },
                { value: "view_limit_reached", label: "View limit reached" },
              ]}
              className={styles.filterSelect}
            />
          </div>
        </ComicPagePanel>
      </ComicPageRow>

      <div ref={scrollRef} className={styles.listShell}>
        {query.isPending ? (
          <div className={styles.loaderRow}>
            <SakuraPetalLoader />
          </div>
        ) : items.length === 0 ? (
          <p className={styles.empty}>No share links found.</p>
        ) : (
          items.map((link) => (
            <ShareLinkManagementRow
              key={link.id}
              link={link}
              onChanged={() => void query.refetch()}
            />
          ))
        )}

        <div ref={sentinelRef} className={styles.sentinel} aria-hidden />
        {query.isFetchingNextPage ? (
          <div className={styles.loaderRow}>
            <SakuraPetalLoader />
          </div>
        ) : null}
      </div>
    </div>
  );
}
