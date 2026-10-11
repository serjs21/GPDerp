"use client";

import { useTranslations } from "next-intl";
import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { formatComicLabelText } from "@/components/ComicBurstLabel/formatComicLabelText";
import { ComicModalInput } from "@/components/ComicModalInput";
import { ComicPagePanel } from "@/components/ComicPageLayout";
import { COMIC_LABEL_NAME_MAX, COMIC_LABEL_NAME_MIN } from "./comicLabelShapes";
import type { LabelPreviewPanelProps } from "./LabelPreviewPanel.types";
import { isFineLabelText } from "./utils/isFineLabelText";
import styles from "./ComicLabelCreationModal.module.css";

/** Live burst preview with the name typed directly over it; "this is fine" names get the fine panel. */
export function LabelPreviewPanel({
  name,
  trimmedName,
  color,
  shape,
  nameInputRef,
  onNameChange,
}: LabelPreviewPanelProps) {
  const t = useTranslations("ComicLabelCreationModal");
  const nameTooShort = trimmedName.length < COMIC_LABEL_NAME_MIN;

  return (
    <ComicPagePanel
      background={isFineLabelText(trimmedName) ? "fine" : "solid"}
      color="white"
      contentAlign="center"
      className={styles.previewPanel}
      title={t("previewTitle")}
      footer={nameTooShort ? t("minChars", { min: COMIC_LABEL_NAME_MIN }) : undefined}
    >
      <div className={styles.previewStage}>
        <div className={styles.burstWrap}>
          <ComicBurstLabel
            text={formatComicLabelText(trimmedName || "__")}
            fill={color}
            shapeKind={shape.kind}
            spikeCount={shape.spikeCount}
            randomness={shape.randomness}
            seed={shape.id}
          />
          <ComicModalInput
            ref={nameInputRef}
            className={styles.previewInput}
            value={name}
            maxLength={COMIC_LABEL_NAME_MAX}
            aria-label={t("nameAriaLabel")}
            placeholder=""
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => onNameChange(e.target.value.slice(0, COMIC_LABEL_NAME_MAX))}
          />
        </div>
      </div>
    </ComicPagePanel>
  );
}
