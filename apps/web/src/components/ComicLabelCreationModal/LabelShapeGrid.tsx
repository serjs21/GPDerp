"use client";

import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { ComicPagePanel, ComicPageRow } from "@/components/ComicPageLayout";
import { COMIC_LABEL_SHAPE_PRESETS, COMIC_LABEL_SHAPE_PREVIEW_TEXT } from "./comicLabelShapes";
import type { LabelShapeGridProps } from "./LabelShapeGrid.types";
import styles from "./ComicLabelCreationModal.module.css";

const SHAPE_ROWS = [COMIC_LABEL_SHAPE_PRESETS.slice(0, 3), COMIC_LABEL_SHAPE_PRESETS.slice(3)];

/** Two rows of selectable shape panels; the selected one is tinted with the label color. */
export function LabelShapeGrid({ shapeId, color, onShapeChange }: LabelShapeGridProps) {
  const t = useTranslations("ComicLabelCreationModal");

  return (
    <div className={styles.shapeRows}>
      {SHAPE_ROWS.map((row, rowIndex) => (
        <ComicPageRow key={rowIndex} className={styles.shapeRow}>
          {row.map((preset) => {
            const selected = shapeId === preset.id;
            return (
              <ComicPagePanel
                key={preset.id}
                selectable
                selected={selected}
                onSelect={() => onShapeChange(preset.id)}
                background={selected ? "solid" : "halftone"}
                color="white"
                overflowVisible
                flexWeight={1}
                className={styles.shapePanel}
                ariaLabel={t("shapeAriaLabel", { shape: t(preset.labelKey) })}
                style={selected ? ({ "--comic-panel-base": color } as CSSProperties) : undefined}
              >
                <div className={styles.shapePreview}>
                  <ComicBurstLabel
                    text={COMIC_LABEL_SHAPE_PREVIEW_TEXT}
                    fill="#ffffff"
                    stroke={selected ? "#111111" : "#555555"}
                    shapeKind={preset.kind}
                    spikeCount={preset.spikeCount}
                    randomness={preset.randomness}
                    seed={preset.id}
                    fontSize={14}
                    paddingX={22}
                    paddingY={14}
                  />
                </div>
              </ComicPagePanel>
            );
          })}
        </ComicPageRow>
      ))}
    </div>
  );
}
