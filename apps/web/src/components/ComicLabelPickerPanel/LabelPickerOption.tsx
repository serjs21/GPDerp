"use client";

import { useTranslations } from "next-intl";
import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { formatComicLabelText } from "@/components/ComicBurstLabel/formatComicLabelText";
import { resolveComicLabelShapePreset } from "@/components/ComicLabelCreationModal/comicLabelShapes";
import { ComicPagePanel } from "@/components/ComicPageLayout";
import type { LabelPickerOptionProps } from "./LabelPickerOption.types";
import { labelFill, selectedPanelStyle } from "./utils/labelPickerUtils";
import styles from "./ComicLabelPickerPanel.module.css";

/** One selectable label burst; selected ones get a sunburst tinted with the label color. */
export function LabelPickerOption({ label, selected, disabled, onToggle }: LabelPickerOptionProps) {
  const t = useTranslations("ComicLabelPickerPanel");
  const shape = resolveComicLabelShapePreset(label.shape);

  return (
    <ComicPagePanel
      selectable={!disabled}
      selected={selected}
      onSelect={() => onToggle(label)}
      background={selected ? "sunburst" : "halftone"}
      color="white"
      overflowVisible
      flexWeight={1}
      className={[styles.labelPanel, disabled && styles.labelPanelDisabled].filter(Boolean).join(" ")}
      style={selected ? selectedPanelStyle(label.color) : undefined}
      ariaLabel={disabled ? t("disabledAriaLabel", { name: label.name }) : label.name}
    >
      <div className={styles.labelPreview}>
        <ComicBurstLabel
          text={formatComicLabelText(label.name)}
          fill={labelFill(label.color)}
          shapeKind={shape.kind}
          spikeCount={shape.spikeCount}
          randomness={shape.randomness}
          seed={shape.id}
          fontSize={18}
        />
      </div>
    </ComicPagePanel>
  );
}
