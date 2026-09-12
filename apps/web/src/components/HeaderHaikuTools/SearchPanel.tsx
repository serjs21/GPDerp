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

/** Match UserMenu trigger comic-label height (36px avatar frame). */
const PANEL_HEIGHT_PX = 36;

type HoverTarget = "labels" | "search" | null;

export type SearchPanelProps = {
  className?: string;
  /** Force hover state (Storybook / tests). */
  forcedHover?: HoverTarget;
};

function SlotFace({ hidden, children }: { hidden: boolean; children: ReactNode }) {
  return (
    <span
      className={`${styles.slotFace}${hidden ? ` ${styles.slotFaceHidden}` : ""}`}
      aria-hidden={hidden || undefined}
    >
      {children}
    </span>
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
  const sharpShape = resolveComicLabelShapePreset("sharp");
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
        className={`${styles.searchAnchor}${className ? ` ${className}` : ""}`}
        onMouseLeave={() => setHoverIfLive(null)}
      >
        <div className={styles.shell}>
          <ComicBurstLabel
            className={styles.frame}
            text="Haiku tools"
            shapeKind={sharpShape.kind}
            spikeCount={sharpShape.spikeCount}
            randomness={sharpShape.randomness}
            seed={sharpShape.id}
            fontSize={PANEL_HEIGHT_PX}
            paddingX={28}
            paddingY={0}
            strokeWidth={3}
            fill="#f7f4ef"
          >
            {/* Tight layout sizer; interactive controls overlay in `.panel`. */}
            <span aria-hidden />
          </ComicBurstLabel>

          <div className={styles.panel} role="group" aria-label="Haiku tools">
            <div className={styles.slot}>
              <button
                type="button"
                className={styles.panelButton}
                aria-label="Filter and manage labels"
                aria-expanded={labels.modalOpen}
                disabled={!labels.canOpen}
                onMouseEnter={() => setHoverIfLive("labels")}
                onFocus={() => setHoverIfLive("labels")}
                onClick={() => labels.setModalOpen(true)}
              >
                <SlotFace hidden={activeHover === "labels"}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/tag_white_fill.svg"
                    alt=""
                    className={`${styles.iconImg} ${styles.iconImgLight}`}
                    width={22}
                    height={28}
                  />
                </SlotFace>
                <SlotFace hidden={activeHover !== "labels"}>
                  <span className={styles.actionName}>Labels</span>
                </SlotFace>
              </button>
            </div>

            <div className={styles.slot}>
              <button
                type="button"
                className={styles.panelButton}
                aria-label="Search haikus"
                aria-expanded={expanded}
                onMouseEnter={() => setHoverIfLive("search")}
                onFocus={() => setHoverIfLive("search")}
                onClick={openSearch}
              >
                <SlotFace hidden={activeHover === "search"}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/search.svg"
                    alt=""
                    className={styles.iconImg}
                    width={28}
                    height={28}
                  />
                </SlotFace>
                <SlotFace hidden={activeHover !== "search"}>
                  <span className={styles.actionName}>Search</span>
                </SlotFace>
              </button>
            </div>
          </div>
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

      <LabelFilterExtras labels={labels} />
    </>
  );
}
