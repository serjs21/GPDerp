"use client";

import { useState, type ReactNode } from "react";
import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { formatComicLabelText } from "@/components/ComicBurstLabel/formatComicLabelText";
import { resolveComicLabelShapePreset } from "@/components/ComicLabelCreationModal/comicLabelShapes";
import { FilterManageLabelsModal } from "@/components/FilterManageLabelsModal";
import { useHeaderHaikuLabelManage } from "./useHeaderHaikuLabelManage";
import { useHeaderHaikuSearch } from "./useHeaderHaikuSearch";
import toolStyles from "./HeaderHaikuTools.module.css";
import styles from "./SearchPanel.module.css";

type HoverTarget = "labels" | "search" | null;

export type SearchPanelProps = {
  className?: string;
  /** Force hover state (Storybook / tests). */
  forcedHover?: HoverTarget;
};

function SlotFace({
  hiddenClass,
  hidden,
  children,
}: {
  hiddenClass: string;
  hidden: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`${styles.slotFace}${hidden ? ` ${hiddenClass}` : ""}`}
      aria-hidden={hidden || undefined}
    >
      {children}
    </div>
  );
}

function LabelFilterExtras({
  labels,
}: {
  labels: ReturnType<typeof useHeaderHaikuLabelManage>;
}) {
  return (
    <>
      {labels.chips.length > 0 ? (
        <div className={toolStyles.filterChips} aria-label="Active label filters">
          {labels.chips.map((label) => {
            const shape = resolveComicLabelShapePreset(label.shape);
            return (
              <div key={label.id} className={toolStyles.filterChip}>
                <ComicBurstLabel
                  className={toolStyles.filterChipBurst}
                  text={formatComicLabelText(label.name)}
                  fill={label.color || "#888888"}
                  shapeKind={shape.kind}
                  spikeCount={shape.spikeCount}
                  randomness={shape.randomness}
                  seed={shape.id}
                  fontSize={14}
                />
                <button
                  type="button"
                  className={toolStyles.filterChipRemove}
                  aria-label={`Remove filter ${label.name}`}
                  onClick={() => labels.removeLabelId(label.id)}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      ) : null}

      {labels.accountId ? (
        <FilterManageLabelsModal
          open={labels.modalOpen}
          accountId={labels.accountId}
          initialTab="filter"
          selectedIds={labels.selectedLabelIds}
          onApply={labels.setSelectedLabelIds}
          onClose={() => labels.setModalOpen(false)}
        />
      ) : null}
    </>
  );
}

export function SearchPanel({ className, forcedHover }: SearchPanelProps) {
  const [hover, setHover] = useState<HoverTarget>(null);
  const activeHover = forcedHover !== undefined ? forcedHover : hover;
  const labels = useHeaderHaikuLabelManage();
  const {
    enabled: searchEnabled,
    expanded,
    fadingOut,
    searchString,
    setSearchString,
    openSearch,
    onBlur,
    inputRef,
  } = useHeaderHaikuSearch();

  if (!labels.enabled || !searchEnabled) return null;

  const setHoverIfLive = (next: HoverTarget) => {
    if (forcedHover === undefined) setHover(next);
  };

  return (
    <>
      <div
        className={`${styles.panel}${className ? ` ${className}` : ""}`}
        onMouseLeave={() => setHoverIfLive(null)}
      >
        <div className={styles.slot}>
          <SlotFace
            hiddenClass={styles.slotFaceHiddenLeft}
            hidden={activeHover === "search"}
          >
            <button
              type="button"
              className={`${toolStyles.iconButton} ${styles.panelButton}`}
              aria-label="Filter and manage labels"
              aria-expanded={labels.modalOpen}
              disabled={!labels.canOpen}
              onMouseEnter={() => setHoverIfLive("labels")}
              onFocus={() => setHoverIfLive("labels")}
              onClick={() => labels.setModalOpen(true)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/tag_white_fill.svg"
                alt=""
                className={toolStyles.iconImg}
                width={22}
                height={28}
              />
            </button>
          </SlotFace>
          <SlotFace
            hiddenClass={styles.slotFaceHiddenRight}
            hidden={activeHover !== "search"}
          >
            <span className={styles.actionName}>Search</span>
          </SlotFace>
        </div>

        <div className={styles.searchAnchor}>
          <div className={styles.slot}>
            <SlotFace
              hiddenClass={styles.slotFaceHiddenRight}
              hidden={activeHover === "labels"}
            >
              <button
                type="button"
                className={`${toolStyles.iconButton} ${styles.panelButton}`}
                aria-label="Search haikus"
                aria-expanded={expanded}
                onMouseEnter={() => setHoverIfLive("search")}
                onFocus={() => setHoverIfLive("search")}
                onClick={openSearch}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/search.svg"
                  alt=""
                  className={toolStyles.iconImg}
                  width={28}
                  height={28}
                />
              </button>
            </SlotFace>
            <SlotFace
              hiddenClass={styles.slotFaceHiddenLeft}
              hidden={activeHover !== "labels"}
            >
              <span className={styles.actionName}>Labels</span>
            </SlotFace>
          </div>

          {expanded ? (
            <input
              ref={inputRef}
              className={[
                toolStyles.searchInput,
                fadingOut ? toolStyles.searchInputFadeOut : "",
              ]
                .filter(Boolean)
                .join(" ")}
              type="search"
              value={searchString}
              onChange={(event) => setSearchString(event.target.value)}
              onBlur={onBlur}
              placeholder="Search titles…"
              aria-label="Search haiku titles"
              autoComplete="off"
              spellCheck={false}
            />
          ) : null}
        </div>
      </div>

      <LabelFilterExtras labels={labels} />
    </>
  );
}
