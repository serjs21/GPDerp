"use client";

import { useState, type CSSProperties } from "react";
import type { LabelDto } from "@/api/labels";
import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { formatComicLabelText } from "@/components/ComicBurstLabel/formatComicLabelText";
import { ComicLabelCreationModal } from "@/components/ComicLabelCreationModal";
import { ComicPagePanel, ComicPageRow } from "@/components/ComicPageLayout";
import {
  COMIC_PANEL_COLORS,
  type ComicPanelBackground,
  type ComicPanelColor,
} from "@/components/ComicPageLayout/comicPagePresets";
import styles from "./ManageLabelCreatePanel.module.css";

export type ManageLabelCreatePanelProps = {
  accountId: string;
  onCreated?: (label: LabelDto) => void | Promise<void>;
  color?: ComicPanelColor;
  background?: ComicPanelBackground;
  className?: string;
};

const CREATE_HOVER = COMIC_PANEL_COLORS.info.base;

export function ManageLabelCreatePanel({
  accountId,
  onCreated,
  color = "white",
  background = "solid",
  className,
}: ManageLabelCreatePanelProps) {
  const [open, setOpen] = useState(false);

  const hoverStyle = {
    "--manage-create-hover-fill": CREATE_HOVER,
  } as CSSProperties;

  return (
    <article className={[styles.root, className].filter(Boolean).join(" ")}>
      <ComicPageRow className={styles.strip}>
        <ComicPagePanel
          selectable
          selected
          background={background}
          color={color}
          flexWeight={1}
          className={styles.createPanel}
          style={hoverStyle}
          ariaLabel="Create a new one"
          onSelect={() => setOpen(true)}
        >
          <div className={styles.createContent}>
            <ComicBurstLabel
              className={styles.createBurst}
              text={formatComicLabelText("Create a new one")}
              fill="#17131A"
              shapeKind="rect"
              fontSize={18}
              leading={
                // eslint-disable-next-line @next/next/no-img-element -- static public SVG asset
                <img src="/label_modal/create.svg" alt="" draggable={false} />
              }
            />
          </div>
        </ComicPagePanel>
      </ComicPageRow>

      <ComicLabelCreationModal
        open={open}
        accountId={accountId}
        onClose={() => setOpen(false)}
        onCreated={async (label) => {
          await onCreated?.(label);
        }}
      />
    </article>
  );
}
