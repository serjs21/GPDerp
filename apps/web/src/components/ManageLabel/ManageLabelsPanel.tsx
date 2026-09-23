"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type UIEvent,
} from "react";
import { labelQueryKeys } from "@/api/labels";
import { ComicModalInput, ComicModalSearchPanel } from "@/components/ComicModalInput";
import { SakuraPetalLoader } from "@/components/Loaders";
import { useAccountLabels } from "@/hooks/useAccountLabels";
import { MAGIC_ENTER_STAGGER_MS } from "./consts/magicAnimationConsts";
import { ManageLabel } from "./ManageLabel";
import { ManageLabelCreatePanel } from "./ManageLabelCreatePanel";
import styles from "./ManageLabelsPanel.module.css";

const SEARCH_DEBOUNCE_MS = 200;
const PAGE_SIZE = 12;

export type ManageLabelsPanelProps = {
  accountId: string;
  /** When false, skips fetch until activated (inactive modal tab). */
  active?: boolean;
  className?: string;
  /** Comic search panel chrome (modal) vs plain input (page). */
  searchVariant?: "comic" | "plain";
  showCreate?: boolean;
};

export function ManageLabelsPanel({
  accountId,
  active = true,
  className,
  searchVariant = "comic",
  showCreate = true,
}: ManageLabelsPanelProps) {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  /** labelId → boingInUp delay ms (insert order). */
  const [enterDelays, setEnterDelays] = useState<Record<string, number>>({});
  const searchRef = useRef<HTMLInputElement>(null);
  const knownIdsRef = useRef<Set<string> | null>(null);
  const nextEnterAtRef = useRef(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedQ(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    if (!active) {
      setSearchInput("");
      setDebouncedQ("");
      knownIdsRef.current = null;
      setEnterDelays({});
      nextEnterAtRef.current = 0;
      return;
    }
    window.requestAnimationFrame(() => {
      searchRef.current?.focus();
    });
  }, [active]);

  const {
    pagedLabels,
    hasNextPage,
    isFetchingNextPage,
    isPagedLoading,
    fetchNextPage,
    fetch,
  } = useAccountLabels({
    accountId,
    autofetch: active && Boolean(accountId),
    pageSize: PAGE_SIZE,
    q: debouncedQ,
    includeConnectedHaikus: true,
  });

  const scheduleEnterAnimations = useCallback((orderedIds: string[]) => {
    if (orderedIds.length === 0) return;
    const now = performance.now();
    setEnterDelays((prev) => {
      const next = { ...prev };
      for (const id of orderedIds) {
        if (id in next) continue;
        const startAt = Math.max(now, nextEnterAtRef.current);
        next[id] = Math.max(0, startAt - now);
        nextEnterAtRef.current = startAt + MAGIC_ENTER_STAGGER_MS;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!active || isPagedLoading) return;
    const currentIds = pagedLabels.map((label) => label.id);
    const currentSet = new Set(currentIds);

    if (knownIdsRef.current == null) {
      knownIdsRef.current = currentSet;
      return;
    }

    const addedInListOrder = currentIds.filter((id) => !knownIdsRef.current!.has(id));
    if (addedInListOrder.length > 0) {
      scheduleEnterAnimations(addedInListOrder);
    }
    knownIdsRef.current = currentSet;
  }, [active, isPagedLoading, pagedLabels, scheduleEnterAnimations]);

  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: [...labelQueryKeys.all, "account", accountId, "paged"],
    });
    void fetch(true);
  }, [accountId, fetch, queryClient]);

  const clearEnterAnimation = useCallback((labelId: string) => {
    setEnterDelays((prev) => {
      if (!(labelId in prev)) return prev;
      const next = { ...prev };
      delete next[labelId];
      return next;
    });
  }, []);

  const onListScroll = (event: UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (remaining > 80) return;
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  };

  const searchInputProps = {
    ref: searchRef,
    type: "search" as const,
    value: searchInput,
    onChange: (e: ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value),
    placeholder: "Search labels…",
    "aria-label": "Search labels by name",
    autoComplete: "off" as const,
    spellCheck: false,
  };

  const createPanel =
    showCreate && !isPagedLoading ? (
      <ManageLabelCreatePanel accountId={accountId} onCreated={() => refresh()} />
    ) : null;

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      {searchVariant === "comic" ? (
        <div className={styles.searchChrome}>
          <ComicModalSearchPanel {...searchInputProps} />
        </div>
      ) : (
        <div className={styles.searchPlain}>
          <ComicModalInput {...searchInputProps} />
        </div>
      )}

      <div className={styles.listScroll} onScroll={onListScroll}>
        {isPagedLoading ? (
          <div className={styles.loaderRow}>
            <SakuraPetalLoader />
          </div>
        ) : (
          <>
            {pagedLabels.length === 0 ? (
              <div className={styles.emptyLayout}>
                <p className={styles.empty}>
                  {debouncedQ ? "No labels found" : "No labels yet."}
                </p>
              </div>
            ) : (
              <>
                {pagedLabels.map((label) => {
                  const enterDelayMs = enterDelays[label.id];
                  const animateEnter = enterDelayMs != null;
                  return (
                    <ManageLabel
                      key={label.id}
                      accountId={label.accountId}
                      label={label}
                      onChanged={refresh}
                      animateEnter={animateEnter}
                      enterDelayMs={enterDelayMs ?? 0}
                      onEnterAnimationEnd={() => clearEnterAnimation(label.id)}
                    />
                  );
                })}
                {isFetchingNextPage ? (
                  <div className={styles.loaderRow}>
                    <SakuraPetalLoader />
                  </div>
                ) : null}
              </>
            )}
          </>
        )}
      </div>
      {createPanel}
    </div>
  );
}
