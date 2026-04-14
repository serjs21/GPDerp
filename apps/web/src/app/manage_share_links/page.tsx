"use client";

import { Input, Select, Space, Typography } from "antd";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ShareLinkEntry } from "@/components/ShareLinkEntry/ShareLinkEntry";
import { SakuraPetalLoader } from "@/components/Loaders";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { useEndOfContentScroll } from "@/hooks/useEndOfContentScroll";
import { useShareLinks } from "@/hooks/useShareLinks";
import styles from "./styles.module.css";

export default function ManageShareLinksPage() {
  const router = useRouter();
  const { initialized, isLoggedIn } = useAuthenticationState();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initialized) return;
    if (!isLoggedIn) router.replace("/");
  }, [initialized, isLoggedIn, router]);

  const { query, items, filter, search, searchInput, setSearchInput, updateSearchParams, onEnd } =
    useShareLinks(initialized && isLoggedIn);

  useEndOfContentScroll(scrollRef, sentinelRef, onEnd, {
    enabled: Boolean(initialized && isLoggedIn && query.hasNextPage && !query.isFetchingNextPage),
  });

  if (!initialized || !isLoggedIn) return null;

  return (
    <div className={styles.page}>
      <section className={styles.container}>
        <Space className={styles.filters} wrap>
          <Input.Search
            placeholder="Search haiku subject"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onSearch={(value) => updateSearchParams({ filter, search: value })}
            allowClear
            style={{ width: 280 }}
          />
          <Select
            allowClear
            placeholder="Filter"
            value={filter}
            onChange={(value) => updateSearchParams({ filter: value, search })}
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
              { value: "expired", label: "Expired" },
              { value: "view_limit_reached", label: "View limit reached" },
            ]}
            style={{ width: 220 }}
          />
        </Space>

        <div ref={scrollRef} className={styles.listShell}>
          {query.isPending ? (
            <div className={styles.loaderRow}>
              <SakuraPetalLoader />
            </div>
          ) : items.length === 0 ? (
            <Typography.Paragraph type="secondary" className={styles.empty}>
              No share links found.
            </Typography.Paragraph>
          ) : (
            items.map((link) => (
              <ShareLinkEntry key={link.id} link={link} onChanged={() => void query.refetch()} />
            ))
          )}

          <div ref={sentinelRef} className={styles.sentinel} aria-hidden />
          {query.isFetchingNextPage ? (
            <div className={styles.loaderRow}>
              <SakuraPetalLoader />
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
