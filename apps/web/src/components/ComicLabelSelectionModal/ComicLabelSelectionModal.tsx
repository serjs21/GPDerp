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

export type ComicLabelSelectionModalProps = {
  open: boolean;
  haiku: HaikuDto;
  onClose: () => void;
  onSaved?: () => void;
};

type SelectableLabel = {
  id: string;
  name: string;
  color: string;
  shape: string;
};

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

export function ComicLabelSelectionModal({
  open,
  haiku,
  onClose,
  onSaved,
}: ComicLabelSelectionModalProps) {
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
    // API application order is oldest→newest; keep haiku order for save payload.
    setSelectedIds([...haiku.labels].map((l) => l.id).reverse());
    window.requestAnimationFrame(() => {
      searchRef.current?.focus();
    });
  }, [open, haiku.labels]);

  const {
    pagedLabels,
    hasNextPage,
    isFetchingNextPage,
    isPagedLoading,
    fetchNextPage,
    setHaikuLabels,
    isSettingLabels,
  } = useAccountLabels({
    accountId: haiku.accountId,
    autofetch: open,
    pageSize: PAGE_SIZE,
    q: debouncedQ,
  });

  const labelById = useMemo(() => {
    const map = new Map<string, SelectableLabel>();
    for (const label of haiku.labels) {
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
  }, [haiku.labels, pagedLabels]);

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  // Freeze order on open / search change; append as pages load. Never move on select.
  useEffect(() => {
    if (!open) return;

    const rebuild = orderQueryKey.current !== debouncedQ;
    if (rebuild) {
      orderQueryKey.current = debouncedQ;
    }

    // Prefer live selection; fall back to haiku labels so first paint (before seed) still pins them.
    const seedIds =
      selectedIds.length > 0
        ? selectedIds
        : [...haiku.labels].map((l) => l.id).reverse();

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
        next.push(label.id);
        seen.add(label.id);
      }

      if (next.length === base.length && next.every((id, i) => id === base[i])) {
        return prev;
      }
      return next;
    });
  }, [open, debouncedQ, pagedLabels, selectedIds, labelById, haiku.labels]);

  const displayLabels = useMemo((): SelectableLabel[] => {
    return listOrderIds
      .map((id) => labelById.get(id))
      .filter((label): label is SelectableLabel => Boolean(label));
  }, [listOrderIds, labelById]);

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

  const submit = () => {
    void setHaikuLabels({
      haikuId: haiku.id,
      labelIds: selectedIds,
      onSuccess: async () => {
        comicToast.success("Labels saved");
        onSaved?.();
        onClose();
      },
      onError: async () => {
        comicToast.error("Could not save labels");
      },
    });
  };

  const canSave = !isSettingLabels;

  return (
    <ComicPageDialog
      open={open}
      showClose
      title="Labels"
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
            aria-busy={isSettingLabels}
            onClick={submit}
          >
            <ComicBurstLabel
              className={styles.saveBurst}
              text={formatComicLabelText("Save")}
              fill={canSave ? SAVE_FILL : SAVE_DISABLED_FILL}
              shapeKind="rect"
            />
          </button>
        </div>
      </div>
    </ComicPageDialog>
  );
}
