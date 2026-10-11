"use client";

import { useTranslations } from "next-intl";
import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { formatComicLabelText } from "@/components/ComicBurstLabel/formatComicLabelText";
import { ComicPressButton } from "@/components/ComicPressButton";
import { Tooltip } from "@/components/StyledComponents";
import type { LabelSaveButtonProps } from "./LabelSaveButton.types";
import styles from "./ComicLabelCreationModal.module.css";

const SAVE_DISABLED_FILL = "#9e9e9e";

const SAVE_COPY_KEYS = {
  create: { text: "create", ariaLabel: "createAriaLabel" },
  edit: { text: "save", ariaLabel: "saveAriaLabel" },
} as const;

/** Create / Save burst in the label color; grey with a reason tooltip while blocked or busy. */
export function LabelSaveButton({ mode, color, blockReason, busy, onSave }: LabelSaveButtonProps) {
  const t = useTranslations("ComicLabelCreationModal");
  const canSave = !blockReason && !busy;
  const copyKeys = SAVE_COPY_KEYS[mode];

  return (
    <div className={styles.footerRow}>
      <Tooltip title={blockReason ?? ""}>
        <span className={styles.tooltipWrap}>
          <ComicPressButton
            type="submit"
            className={styles.saveButton}
            disabled={!canSave}
            aria-busy={busy || undefined}
            aria-label={t(copyKeys.ariaLabel)}
            onClick={(event) => {
              event.preventDefault();
              if (!canSave) return;
              onSave();
            }}
          >
            <ComicBurstLabel
              className={styles.saveBurst}
              text={formatComicLabelText(t(copyKeys.text))}
              fill={canSave ? color : SAVE_DISABLED_FILL}
              shapeKind="rect"
              seed="save-rect"
              fontSize={22}
              paddingX={48}
              paddingY={10}
              strokeWidth={3}
              stretch
            />
          </ComicPressButton>
        </span>
      </Tooltip>
    </div>
  );
}
