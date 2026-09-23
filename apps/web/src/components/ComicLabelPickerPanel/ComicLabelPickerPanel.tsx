"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type AnimationEvent,
  type CSSProperties,
  type UIEvent,
} from "react";
import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { formatComicLabelText } from "@/components/ComicBurstLabel/formatComicLabelText";
import { resolveComicLabelShapePreset } from "@/components/ComicLabelCreationModal/comicLabelShapes";
import { ComicModalSearchPanel } from "@/components/ComicModalInput";
import {
  ComicPagePanel,
  ComicPageRow,
} from "@/components/ComicPageLayout";
import { SakuraPetalLoader } from "@/components/Loaders";
import { useAccountLabels } from "@/hooks/useAccountLabels";
import { MAGIC_PUFF_STAGGER_MS } from "@/components/ManageLabel/consts/magicAnimationConsts";
import styles from "./ComicLabelPickerPanel.module.css";

const SAVE_FILL = "#17131A";
const SAVE_DISABLED_FILL = "#9e9e9e";
const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 200;

export type ComicLabelPickerSeedLabel = {
  id: string;
  name: string;
  color: string;
  shape: string;
};

export type ComicLabelPickerPanelProps = {
  /** When false, skips fetch/seed until activated (inactive tab). */
  active: boolean;
  accountId: string;
  seedLabelIds: string[];
  /** Extra labels not yet in paged catalog (e.g. haiku labels). */
  knownLabels?: ComicLabelPickerSeedLabel[];
  footerLabel: string;
  onFooter: (selectedIds: string[]) => void;
  /** Fires whenever the in-panel selection changes (after seed or toggle). */
  onSelectionChange?: (selectedIds: string[]) => void;
  footerBusy?: boolean;
  footerDisabled?: boolean;
  /** When set, selecting beyond this count is ignored (deselect still works). */
  maxSelected?: number;
  className?: string;
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

export function ComicLabelPickerPanel({
  active,
  accountId,
  seedLabelIds,
  knownLabels = [],
  footerLabel,
  onFooter,
  onSelectionChange,
  footerBusy = false,
  footerDisabled = false,
  maxSelected,
  className,
}: ComicLabelPickerPanelProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [listOrderIds, setListOrderIds] = useState<string[]>([]);
  /** Newly selected label → puffIn delay (selection order). */
  const [puffDelays, setPuffDelays] = useState<Record<string, number>>({});
  const searchRef = useRef<HTMLInputElement>(null);
  const seededActive = useRef(false);
  const orderQueryKey = useRef<string | null>(null);
  const nextPuffAtRef = useRef(0);

  const seedLabelSource = useMemo(() => [...seedLabelIds], [seedLabelIds]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedQ(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    if (!active) {
      seededActive.current = false;
      orderQueryKey.current = null;
      setSearchInput("");
      setDebouncedQ("");
      setListOrderIds([]);
      setPuffDelays({});
      nextPuffAtRef.current = 0;
      return;
    }
    if (seededActive.current) return;
    seededActive.current = true;
    setSelectedIds([...seedLabelSource]);
    window.requestAnimationFrame(() => {
      searchRef.current?.focus();
    });
  }, [active, seedLabelSource]);

  useEffect(() => {
    if (!active) return;
    onSelectionChange?.(selectedIds);
  }, [active, selectedIds, onSelectionChange]);

  const {
    pagedLabels,
    hasNextPage,
    isFetchingNextPage,
    isPagedLoading,
    fetchNextPage,
  } = useAccountLabels({
    accountId,
    autofetch: active && Boolean(accountId),
    pageSize: PAGE_SIZE,
    q: debouncedQ,
  });

  const labelById = useMemo(() => {
    const map = new Map<string, ComicLabelPickerSeedLabel>();
    for (const label of knownLabels) {
      map.set(label.id, label);
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
  }, [knownLabels, pagedLabels]);

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  useEffect(() => {
    if (!active) return;

    const rebuild = orderQueryKey.current !== debouncedQ;
    if (rebuild) {
      orderQueryKey.current = debouncedQ;
    }

    const seedIds = selectedIds.length > 0 ? selectedIds : seedLabelSource;

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
      if (keptPrev) return prev;
      return next;
    });
  }, [active, debouncedQ, pagedLabels, selectedIds, labelById, seedLabelSource]);

  const displayLabels = useMemo((): ComicLabelPickerSeedLabel[] => {
    return listOrderIds
      .map((id) => labelById.get(id))
      .filter((label): label is ComicLabelPickerSeedLabel => Boolean(label))
      .filter((label) => matchesQuery(label.name, debouncedQ));
  }, [listOrderIds, labelById, debouncedQ]);

  const rows = useMemo(() => chunkRows(displayLabels, 3), [displayLabels]);

  const schedulePuffIn = (labelId: string) => {
    const now = performance.now();
    const startAt = Math.max(now, nextPuffAtRef.current);
    const delay = Math.max(0, startAt - now);
    nextPuffAtRef.current = startAt + MAGIC_PUFF_STAGGER_MS;
    setPuffDelays((prev) => ({ ...prev, [labelId]: delay }));
  };

  const clearPuffIn = (labelId: string) => {
    setPuffDelays((prev) => {
      if (!(labelId in prev)) return prev;
      const next = { ...prev };
      delete next[labelId];
      return next;
    });
  };

  const toggleLabel = (label: ComicLabelPickerSeedLabel) => {
    if (selectedIds.includes(label.id)) {
      clearPuffIn(label.id);
      setSelectedIds((prev) => prev.filter((id) => id !== label.id));
      return;
    }
    if (maxSelected != null && selectedIds.length >= maxSelected) {
      return;
    }
    schedulePuffIn(label.id);
    setSelectedIds((prev) => [...prev, label.id]);
  };

  const onPuffAnimationEnd = (
    labelId: string,
    event: AnimationEvent<HTMLElement>,
  ) => {
    if (!event.animationName.includes("puffIn")) return;
    clearPuffIn(labelId);
  };

  const onListScroll = (event: UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (remaining > 80) return;
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  };

  const canSave = !footerDisabled && !footerBusy;

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      <ComicModalSearchPanel
        ref={searchRef}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Filter labels…"
        aria-label="Filter labels"
        autoComplete="off"
        spellCheck={false}
      />

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
                  const puffDelay = puffDelays[label.id];
                  const puffing = puffDelay != null;
                  return (
                    <div
                      key={label.id}
                      className={[
                        styles.labelPuffWrap,
                        puffing ? "magictime puffIn" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      style={
                        puffing && puffDelay > 0
                          ? { animationDelay: `${puffDelay}ms` }
                          : undefined
                      }
                      onAnimationEnd={
                        puffing
                          ? (event) => onPuffAnimationEnd(label.id, event)
                          : undefined
                      }
                    >
                      <ComicPagePanel
                        selectable
                        selected={selected}
                        onSelect={() => toggleLabel(label)}
                        background={selected ? "sunburst" : "halftone"}
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
                    </div>
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
          aria-busy={footerBusy || undefined}
          onClick={() => onFooter(selectedIds)}
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
  );
}
