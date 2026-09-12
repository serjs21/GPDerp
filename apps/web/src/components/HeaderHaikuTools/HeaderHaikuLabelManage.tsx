"use client";

import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { formatComicLabelText } from "@/components/ComicBurstLabel/formatComicLabelText";
import { resolveComicLabelShapePreset } from "@/components/ComicLabelCreationModal/comicLabelShapes";
import { FilterManageLabelsModal } from "@/components/FilterManageLabelsModal";
import { useHeaderHaikuLabelManage } from "./useHeaderHaikuLabelManage";
import styles from "./HeaderHaikuTools.module.css";

export function HeaderHaikuLabelManage() {
  const {
    enabled,
    accountId,
    modalOpen,
    setModalOpen,
    chips,
    selectedLabelIds,
    setSelectedLabelIds,
    removeLabelId,
    canOpen,
  } = useHeaderHaikuLabelManage();

  if (!enabled) return null;

  return (
    <>
      <div className={styles.filterRoot}>
        <button
          type="button"
          className={styles.iconButton}
          aria-label="Filter and manage labels"
          aria-expanded={modalOpen}
          onClick={() => setModalOpen(true)}
          disabled={!canOpen}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/tag_white_fill.svg"
            alt=""
            className={styles.iconImg}
            width={22}
            height={28}
          />
        </button>
      </div>

      {chips.length > 0 ? (
        <div className={styles.filterChips} aria-label="Active label filters">
          {chips.map((label) => {
            const shape = resolveComicLabelShapePreset(label.shape);
            return (
              <div key={label.id} className={styles.filterChip}>
                <ComicBurstLabel
                  className={styles.filterChipBurst}
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
                  className={styles.filterChipRemove}
                  aria-label={`Remove filter ${label.name}`}
                  onClick={() => removeLabelId(label.id)}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      ) : null}

      {accountId ? (
        <FilterManageLabelsModal
          open={modalOpen}
          accountId={accountId}
          initialTab="filter"
          selectedIds={selectedLabelIds}
          onApply={setSelectedLabelIds}
          onClose={() => setModalOpen(false)}
        />
      ) : null}
    </>
  );
}
