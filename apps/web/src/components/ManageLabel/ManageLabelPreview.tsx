"use client";

import { useTranslations } from "next-intl";
import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { formatComicLabelText } from "@/components/ComicBurstLabel/formatComicLabelText";
import { resolveComicLabelShapePreset } from "@/components/ComicLabelCreationModal/comicLabelShapes";
import { ComicPagePanel } from "@/components/ComicPageLayout";
import { ComicPressButton } from "@/components/ComicPressButton";
import { MfgDate } from "@/components/MfgDate";
import { OverlayTitle } from "@/components/OverlayTitle";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { MANAGE_LABEL_COMPACT_QUERY } from "./consts/manageLabelLayoutConsts";
import { ManageLabelConnectionsTitle } from "./ManageLabelConnectionsTitle";
import type { ManageLabelPreviewProps } from "./ManageLabelPreview.types";
import styles from "./ManageLabel.module.css";

/** The label's burst with its creation date; pressing it opens the edit modal. */
export function ManageLabelPreview({ label, connectedTotal, onEdit }: ManageLabelPreviewProps) {
  const t = useTranslations("ManageLabel.manageLabel");
  const shape = resolveComicLabelShapePreset(label.shape);
  const compact = useMediaQuery(MANAGE_LABEL_COMPACT_QUERY);

  return (
    <div className={styles.labelSlot}>
      <OverlayTitle title={t("edit")} direction="bottom">
        <ComicPressButton
          className={styles.overlayAction}
          onClick={onEdit}
          aria-label={t("editAriaLabel", { name: label.name })}
        >
          <ComicPagePanel
            background="solid"
            color="white"
            flexWeight={1}
            className={styles.labelPanel}
            ariaLabel={label.name}
            title={
              compact ? <ManageLabelConnectionsTitle labelName={label.name} total={connectedTotal} /> : undefined
            }
          >
            <MfgDate date={label.createdAt} className={styles.createdDate} />
            <div className={styles.labelPreview}>
              <div className={styles.labelPreviewBurst}>
                <ComicBurstLabel
                  text={formatComicLabelText(label.name)}
                  fill={label.color || "#888888"}
                  shapeKind={shape.kind}
                  spikeCount={shape.spikeCount}
                  randomness={shape.randomness}
                  seed={shape.id}
                  fontSize={20}
                />
              </div>
            </div>
          </ComicPagePanel>
        </ComicPressButton>
      </OverlayTitle>
    </div>
  );
}
