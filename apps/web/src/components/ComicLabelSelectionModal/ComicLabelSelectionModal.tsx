"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type UIEvent,
} from "react";
import type { HaikuDto } from "@/api/haikus";
import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { formatComicLabelText } from "@/components/ComicBurstLabel/formatComicLabelText";
import { resolveComicLabelShapePreset } from "@/components/ComicLabelCreationModal/comicLabelShapes";
import {
  ComicPageDialog,
  ComicPagePanel,
  ComicPageRow,
} from "@/components/ComicPageLayout";
import { comicToast } from "@/components/ComicToast";
import { SakuraPetalLoader } from "@/components/Loaders";
import { useAccountLabels } from "@/hooks/useAccountLabels";
import styles from "./ComicLabelSelectionModal.module.css";

const SAVE_FILL = "#17131A";
const SAVE_DISABLED_FILL = "#9e9e9e";
const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 200;

type SelectableLabel = {
  id: string;
  name: string;
  color: string;
  shape: string;
};

type ComicLabelSelectionModalBase = {
  open: boolean;
  onClose: () => void;
};

export type ComicLabelSelectionAssignProps = ComicLabelSelectionModalBase & {
  mode?: "assign";
  haiku: HaikuDto;
  onSaved?: () => void;
  accountId?: never;
  selectedIds?: never;
  onApply?: never;
};

export type ComicLabelSelectionFilterProps = ComicLabelSelectionModalBase & {
  mode: "filter";
  accountId: string;
  selectedIds: string[];
  onApply: (ids: string[]) => void;
  haiku?: never;
  onSaved?: never;
};

export type ComicLabelSelectionModalProps =
  | ComicLabelSelectionAssignProps
  | ComicLabelSelectionFilterProps;

function chunkRows<T>(items: T[], size: number): T[][] {
  if (items.length === 0) return [];
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

function matchesQuery(name: string, q: string): boolean {
  const trimmed = q.trim();
  if (!trimmed) return true;
  return name.toLowerCase().includes(trimmed.toLowerCase());
}

function selectedPanelStyle(color: string): CSSProperties {
  return {
    "--comic-panel-base": `color-mix(in srgb, ${color || "#888888"} 50%, #ffffff)`,
  } as CSSProperties;
}

export function ComicLabelSelectionModal(props: ComicLabelSelectionModalProps) {
  const { open, onClose } = props;
  const isFilter = props.mode === "filter";
  const accountId = isFilter ? props.accountId : props.haiku.accountId;
  const assignHaikuLabels = isFilter ? null : props.haiku.labels;
  const filterSelectedIds = isFilter ? props.selectedIds : null;
  const seedLabelSource = useMemo(() => {
    if (isFilter) return filterSelectedIds ?? [];
    return [...(assignHaikuLabels ?? [])].map((l) => l.id).reverse();
  }, [isFilter, filterSelectedIds, assignHaikuLabels]);
  const haikuLabels = assignHaikuLabels ?? [];

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  /** Stable grid order after open / search; select only toggles highlight. */
  const [listOrderIds, setListOrderIds] = useState<string[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);
  const seededOpen = useRef(false);
  const orderQueryKey = useRef<string | null>(null);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedQ(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    if (!open) {
      seededOpen.current = false;
      orderQueryKey.current = null;
      setSearchInput("");
      setDebouncedQ("");
      setListOrderIds([]);
      return;
    }
    if (seededOpen.current) return;
    seededOpen.current = true;
    setSelectedIds([...seedLabelSource]);
    window.requestAnimationFrame(() => {
      searchRef.current?.focus();
    });
  }, [open, seedLabelSource]);

  const {
    pagedLabels,
    hasNextPage,
    isFetchingNextPage,
    isPagedLoading,
    fetchNextPage,
    setHaikuLabels,
    isSettingLabels,
  } = useAccountLabels({
    accountId,
    autofetch: open,
    pageSize: PAGE_SIZE,
    q: debouncedQ,
  });

  const labelById = useMemo(() => {
    const map = new Map<string, SelectableLabel>();
    for (const label of haikuLabels) {
      map.set(label.id, {
        id: label.id,
        name: label.name,
        color: label.color,
        shape: label.shape,
      });
    }
    for (const label of pagedLabels) {
      map.set(label.id, {
        id: label.id,
        name: label.name,
        color: label.color,
        shape: label.shape,
      });
    }
    return map;
  }, [haikuLabels, pagedLabels]);

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  // Freeze order on open / search change; append as pages load. Never move on select.
  useEffect(() => {
    if (!open) return;

    const rebuild = orderQueryKey.current !== debouncedQ;
    if (rebuild) {
      orderQueryKey.current = debouncedQ;
    }

    const seedIds =
      selectedIds.length > 0 ? selectedIds : seedLabelSource;

    setListOrderIds((prev) => {
      const base = rebuild ? [] : prev;
      const seen = new Set(base);
      const next = [...base];

      if (next.length === 0) {
        for (const id of seedIds) {
          const label = labelById.get(id);
          if (!label || !matchesQuery(label.name, debouncedQ)) continue;
          next.push(id);
          seen.add(id);
        }
      }

      for (const label of pagedLabels) {
        if (seen.has(label.id)) continue;
        if (!matchesQuery(label.name, debouncedQ)) continue;
        next.push(label.id);
        seen.add(label.id);
      }

      const keptPrev =
        !rebuild &&
        next.length === base.length &&
        next.every((id, i) => id === base[i]);
      if (keptPrev) {
        return prev;
      }
      return next;
    });
  }, [open, debouncedQ, pagedLabels, selectedIds, labelById, seedLabelSource]);

  const displayLabels = useMemo((): SelectableLabel[] => {
    return listOrderIds
      .map((id) => labelById.get(id))
      .filter((label): label is SelectableLabel => Boolean(label))
      .filter((label) => matchesQuery(label.name, debouncedQ));
  }, [listOrderIds, labelById, debouncedQ]);

  const rows = useMemo(() => chunkRows(displayLabels, 3), [displayLabels]);

  const toggleLabel = (label: SelectableLabel) => {
    setSelectedIds((prev) => {
      if (prev.includes(label.id)) {
        return prev.filter((id) => id !== label.id);
      }
      return [...prev, label.id];
    });
  };

  const onListScroll = (event: UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (remaining > 80) return;
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  };

  const submitAssign = () => {
    if (isFilter) return;
    void setHaikuLabels({
      haikuId: props.haiku.id,
      labelIds: selectedIds,
      onSuccess: async () => {
        comicToast.success("Labels saved");
        props.onSaved?.();
        onClose();
      },
      onError: async () => {
        comicToast.error("Could not save labels");
      },
    });
  };

  const submitFilter = () => {
    if (!isFilter) return;
    props.onApply(selectedIds);
    onClose();
  };

  const canSave = isFilter ? true : !isSettingLabels;
  const footerLabel = isFilter ? "Done" : "Save";
  const onFooterClick = isFilter ? submitFilter : submitAssign;

  return (
    <ComicPageDialog
      open={open}
      showClose
      title={isFilter ? "Filter labels" : "Labels"}
      className={styles.pageShell}
      contentClassName={styles.dialogContent}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <div className={styles.body}>
        <ComicPagePanel
          background="solid"
          color="white"
          className={styles.searchPanel}
        >
          <input
            ref={searchRef}
            className={styles.searchInput}
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Filter labels…"
            aria-label="Filter labels"
            autoComplete="off"
            spellCheck={false}
          />
        </ComicPagePanel>

        <div className={styles.listScroll} onScroll={onListScroll}>
          {isPagedLoading ? (
            <div className={styles.loaderRow}>
              <SakuraPetalLoader />
            </div>
          ) : displayLabels.length === 0 ? (
            <p className={styles.empty}>No labels found</p>
          ) : (
            <div className={styles.labelRows}>
              {rows.map((row, rowIndex) => (
                <ComicPageRow key={rowIndex} className={styles.labelRow}>
                  {row.map((label) => {
                    const selected = selectedIdSet.has(label.id);
                    const shape = resolveComicLabelShapePreset(label.shape);
                    return (
                      <ComicPagePanel
                        key={label.id}
                        selectable
                        selected={selected}
                        onSelect={() => toggleLabel(label)}
                        background={selected ? "solid" : "halftone"}
                        color="white"
                        overflowVisible
                        flexWeight={1}
                        className={styles.labelPanel}
                        style={selected ? selectedPanelStyle(label.color) : undefined}
                        ariaLabel={label.name}
                      >
                        <div className={styles.labelPreview}>
                          <ComicBurstLabel
                            text={formatComicLabelText(label.name)}
                            fill={label.color || "#888888"}
                            shapeKind={shape.kind}
                            spikeCount={shape.spikeCount}
                            randomness={shape.randomness}
                            seed={shape.id}
                            fontSize={18}
                          />
                        </div>
                      </ComicPagePanel>
                    );
                  })}
                </ComicPageRow>
              ))}
            </div>
          )}
          {isFetchingNextPage ? (
            <div className={styles.nextPageRow}>
              <SakuraPetalLoader />
            </div>
          ) : null}
        </div>

        <div className={styles.footerRow}>
          <button
            type="button"
            className={styles.saveButton}
            disabled={!canSave}
            aria-busy={!isFilter && isSettingLabels}
            onClick={onFooterClick}
          >
            <ComicBurstLabel
              className={styles.saveBurst}
              text={formatComicLabelText(footerLabel)}
              fill={canSave ? SAVE_FILL : SAVE_DISABLED_FILL}
              shapeKind="rect"
            />
          </button>
        </div>
      </div>
    </ComicPageDialog>
  );
}
