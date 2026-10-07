"use client";

import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { formatComicLabelText } from "@/components/ComicBurstLabel/formatComicLabelText";
import { resolveComicLabelShapePreset } from "@/components/ComicLabelCreationModal/comicLabelShapes";
import { LabelsFilterModal } from "@/components/LabelsFilterModal";
import type { LabelFilterExtrasProps } from "./LabelFilterExtras.types";
import toolStyles from "./HeaderHaikuTools.module.css";

/** Active label filter chips under the header plus the labels filter modal. */
export function LabelFilterExtras({ labels, onModalClose }: LabelFilterExtrasProps) {
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
                <span className={toolStyles.filterChipExcludeMark} aria-hidden />
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
