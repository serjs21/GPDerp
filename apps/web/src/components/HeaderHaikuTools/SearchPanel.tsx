"use client";

import {
  useEffect,
  useState,
  type FocusEvent,
  type ReactNode,
} from "react";
import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { formatComicLabelText } from "@/components/ComicBurstLabel/formatComicLabelText";
import { resolveComicLabelShapePreset } from "@/components/ComicLabelCreationModal/comicLabelShapes";
import { LabelsFilterModal } from "@/components/LabelsFilterModal";
import { HEADER_NAV_ICON_SIZE_PX } from "@/consts/header/siteHeaderConsts";
import { useHeaderHaikuLabelManage } from "./useHeaderHaikuLabelManage";
import { useHeaderHaikuSearch } from "./useHeaderHaikuSearch";
import { useHeaderSettingsSearch } from "./useHeaderSettingsSearch";
import toolStyles from "./HeaderHaikuTools.module.css";
import styles from "./SearchPanel.module.css";

/** Match UserMenu trigger comic-label height. */
const PANEL_HEIGHT_PX = HEADER_NAV_ICON_SIZE_PX;

type HoverTarget = "filter" | "search" | null;

export type SearchPanelProps = {
  className?: string;
  /** Force hover state (Storybook / tests). */
  forcedHover?: HoverTarget;
};

function SlotFace({
  hidden,
  enterFrom,
  children,
}: {
  hidden?: boolean;
  /** Horizontal slide origin for hover text (over the icon). */
  enterFrom?: "left" | "right";
  children: ReactNode;
}) {
  const className = [
    styles.slotFace,
    enterFrom === "left" ? styles.slotFaceFromLeft : "",
    enterFrom === "right" ? styles.slotFaceFromRight : "",
    hidden ? styles.slotFaceHidden : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={className} aria-hidden={hidden || undefined}>
      {children}
    </span>
  );
}

function LabelFilterExtras({
  labels,
  onModalClose,
}: {
  labels: ReturnType<typeof useHeaderHaikuLabelManage>;
  onModalClose: () => void;
}) {
  return (
    <>
      {labels.chips.length > 0 || labels.excludeChips.length > 0 ? (
        <div className={toolStyles.filterChips} aria-label="Active label filters">
          {labels.chips.map((label) => {
            const shape = resolveComicLabelShapePreset(label.shape);
            return (
              <div key={`include-${label.id}`} className={toolStyles.filterChip}>
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
          {labels.excludeChips.map((label) => {
            const shape = resolveComicLabelShapePreset(label.shape);
            return (
              <div
                key={`exclude-${label.id}`}
                className={`${toolStyles.filterChip} ${toolStyles.filterChipExclude}`}
              >
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
                <span
                  className={toolStyles.filterChipExcludeMark}
                  aria-hidden
                />
                <button
                  type="button"
                  className={toolStyles.filterChipRemove}
                  aria-label={`Remove exclude filter ${label.name}`}
                  onClick={() => labels.removeExcludedLabelId(label.id)}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      ) : null}

      {labels.accountId ? (
        <LabelsFilterModal
          open={labels.modalOpen}
          accountId={labels.accountId}
          includeIds={labels.selectedLabelIds}
          excludeIds={labels.excludedLabelIds}
          onApply={labels.setLabelFilters}
          onClose={onModalClose}
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
  const haikuSearch = useHeaderHaikuSearch();
  const settingsSearch = useHeaderSettingsSearch();

  const isSettings = settingsSearch.enabled;
  const isHaiku = labels.enabled && haikuSearch.enabled;

  const setHoverIfLive = (next: HoverTarget) => {
    if (forcedHover === undefined) setHover(next);
  };

  const clearHover = () => setHoverIfLive(null);

  // Modal open must not leave the expand/label hover state stuck.
  useEffect(() => {
    if (labels.modalOpen) setHoverIfLive(null);
    // Intentionally only depend on modal visibility.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labels.modalOpen]);

  const setHoverFromFocus = (next: HoverTarget, target: HTMLElement) => {
    // Pointer click + focus restore after modal must not re-stick hover.
    if (target.matches(":focus-visible")) setHoverIfLive(next);
  };

  const clearHoverFromBlur = (event: FocusEvent<HTMLButtonElement>) => {
    const root = event.currentTarget.closest("[data-search-panel-anchor]");
    const related = event.relatedTarget;
    if (related instanceof Node && root?.contains(related)) return;
    clearHover();
  };

  if (!isSettings && !isHaiku) return null;

  const expanded = isSettings ? settingsSearch.expanded : haikuSearch.expanded;
  const fadingOut = isSettings ? false : haikuSearch.fadingOut;
  const searchString = isSettings
    ? settingsSearch.searchString
    : haikuSearch.searchString;
  const setSearchString = isSettings
    ? settingsSearch.setSearchString
    : haikuSearch.setSearchString;
  const inputRef = isSettings ? settingsSearch.inputRef : haikuSearch.inputRef;
  const placeholder = isSettings
    ? settingsSearch.placeholder
    : "Search titles…";
  const inputAriaLabel = isSettings
    ? settingsSearch.ariaLabel
    : "Search haiku titles";
  const searchButtonAriaLabel = isSettings
    ? settingsSearch.buttonAriaLabel
    : "Search haikus";
  const onSearchClick = isSettings
    ? settingsSearch.toggleExpanded
    : haikuSearch.openSearch;
  const onInputBlur = isSettings ? undefined : haikuSearch.onBlur;
  const searchIconSrc = isSettings ? settingsSearch.iconSrc : "/nav/search-icon.svg";

  return (
    <>
      <div
        className={`${styles.searchAnchor}${className ? ` ${className}` : ""}`}
        data-search-panel-anchor=""
        onMouseLeave={clearHover}
      >
        <div className={styles.shell}>
          <ComicBurstLabel
            className={styles.frame}
            text=""
            shapeKind={sharpShape.kind}
            spikeCount={sharpShape.spikeCount}
            randomness={sharpShape.randomness}
            seed={sharpShape.id}
            fontSize={PANEL_HEIGHT_PX}
            paddingX={isSettings ? 16 : 28}
            paddingY={0}
            strokeWidth={3}
            fill="#f7f4ef"
          >
            {/* Tight layout sizer; interactive controls overlay in `.panel`. */}
            <span aria-hidden />
          </ComicBurstLabel>

          <div
            className={[
              styles.panel,
              isSettings ? styles.panelSearchOnly : "",
              !isSettings && activeHover === "filter"
                ? styles.panelHoverLabels
                : "",
              activeHover === "search" ? styles.panelHoverSearch : "",
            ]
              .filter(Boolean)
              .join(" ")}
            role="group"
            aria-label={isSettings ? "Settings search" : "Haiku tools"}
          >
            {!isSettings ? (
              <div className={`${styles.slot} ${styles.slotLabels}`}>
                <button
                  type="button"
                  className={styles.panelButton}
                  aria-label="Filter haikus by labels"
                  aria-expanded={labels.modalOpen}
                  disabled={!labels.canOpen}
                  onMouseEnter={() => setHoverIfLive("filter")}
                  onFocus={(event) =>
                    setHoverFromFocus("filter", event.currentTarget)
                  }
                  onBlur={clearHoverFromBlur}
                  onClick={() => {
                    clearHover();
                    labels.setModalOpen(true);
                  }}
                >
                  <SlotFace>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/nav/filter_label_icon.svg"
                      alt=""
                      className={`${styles.iconImg} ${styles.iconImgLight}`}
                      width={22}
                      height={28}
                    />
                  </SlotFace>
                  <SlotFace
                    enterFrom="left"
                    hidden={activeHover !== "filter"}
                  >
                    <span className={styles.actionName}>Filter</span>
                  </SlotFace>
                </button>
              </div>
            ) : null}

            <div
              className={[
                styles.slot,
                styles.slotSearch,
                isSettings && settingsSearch.tab === "labels" ? styles.slotSearchLabels : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <button
                type="button"
                className={styles.panelButton}
                aria-label={searchButtonAriaLabel}
                aria-expanded={expanded}
                onMouseEnter={() => setHoverIfLive("search")}
                onFocus={(event) =>
                  setHoverFromFocus("search", event.currentTarget)
                }
                onBlur={clearHoverFromBlur}
                onClick={onSearchClick}
              >
                <SlotFace>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={searchIconSrc}
                    alt=""
                    className={styles.iconImg}
                    width={28}
                    height={28}
                  />
                </SlotFace>
                <SlotFace
                  enterFrom="right"
                  hidden={activeHover !== "search"}
                >
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
            onBlur={onInputBlur}
            placeholder={placeholder}
            aria-label={inputAriaLabel}
            autoComplete="off"
            spellCheck={false}
          />
        ) : null}
      </div>

      {!isSettings ? (
        <LabelFilterExtras
          labels={labels}
          onModalClose={() => {
            labels.setModalOpen(false);
            clearHover();
          }}
        />
      ) : null}
    </>
  );
}
