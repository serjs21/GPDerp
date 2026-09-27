"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type UIEvent,
} from "react";
import { createPortal } from "react-dom";
import { labelQueryKeys, type LabelDto } from "@/api/labels";
import { ComicModalInput, ComicModalSearchPanel } from "@/components/ComicModalInput";
import {
  LabelSort,
  LABEL_SORT_DEFAULT_VALUE,
  type LabelSortValue,
} from "@/components/LabelSort";
import { sortLabelItems } from "@/components/LabelSort/utils/sortLabelItems";
import { SakuraPetalLoader } from "@/components/Loaders";
import { useAccountLabels } from "@/hooks/useAccountLabels";
import { buildEnterStaggerDelays } from "./consts/magicAnimationConsts";
import { ManageLabel } from "./ManageLabel";
import { ManageLabelCreatePanel } from "./ManageLabelCreatePanel";
import { SortCreateOrBurst } from "./SortCreateOrBurst";
import styles from "./ManageLabelsPanel.module.css";

const SEARCH_DEBOUNCE_MS = 200;
const PAGE_SIZE = 12;

function mergeDisplayLabels(
  previousOrder: string[],
  pagedLabels: LabelDto[],
  exitingById: Record<string, LabelDto>,
): { order: string[]; labels: LabelDto[] } {
  const liveById = new Map(pagedLabels.map((label) => [label.id, label]));
  // Prefer live API order (createdAt desc → newest first).
  const order = pagedLabels.map((label) => label.id);

  for (const id of Object.keys(exitingById)) {
    if (liveById.has(id)) continue;
    const prevIndex = previousOrder.indexOf(id);
    if (prevIndex <= 0) {
      order.unshift(id);
      continue;
    }
    const neighborBefore = previousOrder
      .slice(0, prevIndex)
      .reverse()
      .find((neighborId) => order.includes(neighborId));
    if (neighborBefore != null) {
      order.splice(order.indexOf(neighborBefore) + 1, 0, id);
    } else {
      order.unshift(id);
    }
  }

  const labels = order
    .map((id) => liveById.get(id) ?? exitingById[id])
    .filter((label): label is LabelDto => Boolean(label));

  return { order, labels };
}

export type ManageLabelsPanelProps = {
  accountId: string;
  /** When false, skips fetch until activated (inactive modal tab). */
  active?: boolean;
  className?: string;
  /** Comic / plain local search, or none when header drives `searchQuery`. */
  searchVariant?: "comic" | "plain" | "none";
  /** Controlled query when `searchVariant` is `"none"` (settings header). */
  searchQuery?: string;
  showCreate?: boolean;
  /** Show the LabelSort panel above the list. */
  showSort?: boolean;
  /** When set, sort (rotated) + create render here instead of above the list. */
  sidePanelTarget?: HTMLElement | null;
};

export function ManageLabelsPanel({
  accountId,
  active = true,
  className,
  searchVariant = "comic",
  searchQuery = "",
  showCreate = true,
  showSort = false,
  sidePanelTarget = null,
}: ManageLabelsPanelProps) {
  const headerDriven = searchVariant === "none";
  const [sort, setSort] = useState<LabelSortValue>(LABEL_SORT_DEFAULT_VALUE);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  /** labelId → boingInUp delay ms (insert order). */
  const [enterDelays, setEnterDelays] = useState<Record<string, number>>({});
  /** Keep deleted rows mounted through boingOutDown after query invalidation. */
  const [exitingById, setExitingById] = useState<Record<string, LabelDto>>({});
  const searchRef = useRef<HTMLInputElement>(null);
  const knownIdsRef = useRef<Set<string> | null>(null);
  const displayOrderRef = useRef<string[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (headerDriven) return;
    const handle = window.setTimeout(() => {
      setDebouncedQ(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [searchInput, headerDriven]);

  useEffect(() => {
    if (!active) {
      setSearchInput("");
      setDebouncedQ("");
      knownIdsRef.current = null;
      displayOrderRef.current = [];
      setEnterDelays({});
      setExitingById({});
      return;
    }
    if (headerDriven) return;
    window.requestAnimationFrame(() => {
      searchRef.current?.focus();
    });
  }, [active, headerDriven]);

  const resolvedQ = headerDriven ? searchQuery.trim() : debouncedQ;

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
    q: resolvedQ,
    includeConnectedHaikus: true,
  });

  // When a sort is selected but more pages remain, finish loading so we can sort in memory.
  useEffect(() => {
    if (!active || !sort.categoryId) return;
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  }, [active, sort.categoryId, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const orderedLabels = useMemo(() => {
    if (!sort.categoryId || hasNextPage) return pagedLabels;
    return sortLabelItems(pagedLabels, sort);
  }, [pagedLabels, hasNextPage, sort]);

  const displayLabels = useMemo(() => {
    const { order, labels } = mergeDisplayLabels(
      displayOrderRef.current,
      orderedLabels,
      exitingById,
    );
    displayOrderRef.current = order;
    return labels;
  }, [orderedLabels, exitingById]);

  const scheduleEnterAnimations = useCallback((orderedIds: string[]) => {
    if (orderedIds.length === 0) return;
    const batch = buildEnterStaggerDelays(orderedIds);
    setEnterDelays((prev) => {
      const next = { ...prev };
      for (const [id, delay] of Object.entries(batch)) {
        if (id in next) continue;
        next[id] = delay;
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

  const handleExitStart = useCallback((label: LabelDto) => {
    setExitingById((prev) =>
      prev[label.id] ? prev : { ...prev, [label.id]: label },
    );
  }, []);

  const handleExitComplete = useCallback((labelId: string) => {
    setExitingById((prev) => {
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

  const sortInSide = showSort && sidePanelTarget != null;
  const sortInFrame = showSort && !sortInSide;
  const createClassName = sortInSide
    ? styles.createInSide
    : sortInFrame
      ? styles.createBesideSort
      : undefined;

  const createPanel =
    showCreate && !isPagedLoading ? (
      <ManageLabelCreatePanel
        accountId={accountId}
        onCreated={() => refresh()}
        color="#4fabf5"
        background="solid"
        className={createClassName}
      />
    ) : null;

  const showEmpty = !isPagedLoading && displayLabels.length === 0;

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      {searchVariant === "comic" ? (
        <div className={styles.searchChrome}>
          <ComicModalSearchPanel {...searchInputProps} />
        </div>
      ) : null}
      {searchVariant === "plain" ? (
        <div className={styles.searchPlain}>
          <ComicModalInput {...searchInputProps} />
        </div>
      ) : null}
      {sortInSide
        ? createPortal(
            <div className={styles.sideStack}>
              <LabelSort
                value={sort}
                onChange={setSort}
                rotated
                color="#ea695e"
                background="solid"
                className={styles.sortInSide}
              />
              {createPanel}
            </div>,
            sidePanelTarget,
          )
        : null}
      {sortInFrame ? (
        <div className={styles.sortRow}>
          <LabelSort
            value={sort}
            onChange={setSort}
            color="#ea695e"
            background="solid"
            className={styles.sortBesideCreate}
          />
          {createPanel}
          {createPanel ? <SortCreateOrBurst /> : null}
        </div>
      ) : null}

      <div className={styles.listScroll} onScroll={onListScroll}>
        {isPagedLoading ? (
          <div className={styles.loaderRow}>
            <SakuraPetalLoader />
          </div>
        ) : (
          <>
            {showEmpty ? (
              <div className={styles.emptyLayout}>
                <p className={styles.empty}>
                  {resolvedQ ? "No labels found" : "No labels yet."}
                </p>
              </div>
            ) : (
              <>
                {displayLabels.map((label) => {
                  const enterDelayMs = enterDelays[label.id];
                  const animateEnter = enterDelayMs != null;
                  const isExiting = Boolean(exitingById[label.id]);
                  return (
                    <ManageLabel
                      key={label.id}
                      accountId={label.accountId}
                      label={label}
                      onChanged={refresh}
                      onExitStart={() => handleExitStart(label)}
                      onExitComplete={() => handleExitComplete(label.id)}
                      forceExiting={isExiting}
                      animateEnter={animateEnter && !isExiting}
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
      {showSort ? null : createPanel}
    </div>
  );
}
