"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type UIEvent,
} from "react";
import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { formatComicLabelText } from "@/components/ComicBurstLabel/formatComicLabelText";
import { ComicPressButton } from "@/components/ComicPressButton";
import { resolveComicLabelShapePreset } from "@/components/ComicLabelCreationModal/comicLabelShapes";
import { ComicModalSearchPanel } from "@/components/ComicModalInput";
import {
  ComicPagePanel,
  ComicPageRow,
} from "@/components/ComicPageLayout";
import { SakuraPetalLoader } from "@/components/Loaders";
import { useAccountLabels } from "@/hooks/useAccountLabels";
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
  /** Labels that cannot be selected (e.g. already chosen on the opposite filter tab). */
  disabledIds?: string[];
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
  disabledIds = [],
  className,
}: ComicLabelPickerPanelProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [listOrderIds, setListOrderIds] = useState<string[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);
  const seededActive = useRef(false);
  const orderQueryKey = useRef<string | null>(null);
  const disabledIdSet = useMemo(() => new Set(disabledIds), [disabledIds]);

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

  const toggleLabel = (label: ComicLabelPickerSeedLabel) => {
    if (disabledIdSet.has(label.id)) return;
    setSelectedIds((prev) => {
      if (prev.includes(label.id)) {
        return prev.filter((id) => id !== label.id);
      }
      if (maxSelected != null && prev.length >= maxSelected) {
        return prev;
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
                  const disabled = disabledIdSet.has(label.id);
                  const shape = resolveComicLabelShapePreset(label.shape);
                  return (
                    <ComicPagePanel
                      key={label.id}
                      selectable={!disabled}
                      selected={selected}
                      onSelect={
                        disabled ? undefined : () => toggleLabel(label)
                      }
                      background={selected ? "sunburst" : "halftone"}
                      color="white"
                      overflowVisible
                      flexWeight={1}
                      className={[
                        styles.labelPanel,
                        disabled ? styles.labelPanelDisabled : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      style={selected ? selectedPanelStyle(label.color) : undefined}
                      ariaLabel={
                        disabled
                          ? `${label.name} (already used in the other filter)`
                          : label.name
                      }
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
        <ComicPressButton
          type="submit"
          className={styles.saveButton}
          disabled={!canSave}
          aria-busy={footerBusy || undefined}
          onClick={(event) => {
            event.preventDefault();
            onFooter(selectedIds);
          }}
        >
          <ComicBurstLabel
            className={styles.saveBurst}
            text={formatComicLabelText(footerLabel)}
            fill={canSave ? SAVE_FILL : SAVE_DISABLED_FILL}
            shapeKind="rect"
            stretch
          />
        </ComicPressButton>
      </div>
    </div>
  );
}
