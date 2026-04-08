"use client";

import { useCallback, useRef } from "react";
import { LabelCreateAction } from "@/components/LabelCreateAction/LabelCreateAction";
import { LabelContainer } from "@/components/LabelContainer/LabelContainer";
import { SakuraPetalLoader } from "@/components/Loaders";
import { useAccountLabels, useManageLabelsAccount } from "@/hooks/useAccountLabels";
import { useEndOfContentScroll } from "@/hooks/useEndOfContentScroll";
import styles from "./styles.module.css";

export default function ManageLabelsPage() {
  const { data: accountId, isPending: isAccountPending } = useManageLabelsAccount();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const {
    pagedLabels,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    fetch,
    isLoading,
  } = useAccountLabels({
    accountId: accountId ?? "",
    autofetch: Boolean(accountId),
  });

  const onEnd = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEndOfContentScroll(scrollRef, sentinelRef, onEnd, {
    enabled: Boolean(accountId) && hasNextPage && !isFetchingNextPage,
  });

  return (
    <div className={styles.page}>
      <section className={styles.container}>
        {accountId ? (
          <LabelCreateAction
            accountId={accountId}
            buttonText="+ Create a new label"
            className={styles.topAction}
            onCreated={async () => {
              await fetch(true);
            }}
          />
        ) : null}

        <div ref={scrollRef} className={styles.listShell}>
          {isAccountPending || isLoading ? (
            <div className={styles.loaderRow}>
              <SakuraPetalLoader />
            </div>
          ) : pagedLabels.length === 0 ? (
            <p className={styles.empty}>No labels yet.</p>
          ) : (
            pagedLabels.map((label) => (
              <LabelContainer
                key={label.id}
                accountId={label.accountId}
                label={label}
                onChanged={() => void fetch(true)}
              />
            ))
          )}
          <div ref={sentinelRef} className={styles.sentinel} aria-hidden />
          {isFetchingNextPage ? (
            <div className={styles.loaderRow}>
              <SakuraPetalLoader />
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
