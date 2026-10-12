"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { LabelDto } from "@/api/labels";
import { formatComicLabelText } from "@/components/ComicBurstLabel/formatComicLabelText";
import { ComicLabelCreationModal } from "@/components/ComicLabelCreationModal";
import { ComicPagePanel } from "@/components/ComicPageLayout";
import { useElementSize } from "@/hooks/useElementSize";
import { TICKET_BASE_SRC } from "./consts/ticketRotationConsts";
import styles from "./ManageLabelCreatePanel.module.css";
import { buildTicketFaceStyle, ticketFaceGeometry } from "./utils/ticketRotationUtils";

export type ManageLabelCreatePanelProps = {
  accountId: string;
  onCreated?: (label: LabelDto) => void | Promise<void>;
  /** Stretch the panel to fill the parent's width and height. */
  stretch?: boolean;
  className?: string;
};

export function ManageLabelCreatePanel({
  accountId,
  onCreated,
  stretch = false,
  className,
}: ManageLabelCreatePanelProps) {
  const t = useTranslations("ManageLabel.createPanel");
  const [open, setOpen] = useState(false);
  const [stageRef, stageSize] = useElementSize<HTMLSpanElement>();
  const faceStyle = buildTicketFaceStyle(
    ticketFaceGeometry(stageSize.width, stageSize.height),
  );

  return (
    <article
      className={[styles.root, stretch ? styles.rootStretch : "", className]
        .filter(Boolean)
        .join(" ")}
    >
      <ComicPagePanel
        selectable
        onSelect={() => setOpen(true)}
        background="halftone"
        color="yellow"
        isMotionBackground={false}
        ariaLabel={t("ariaLabel")}
        className={styles.panel}
      >
        <span ref={stageRef} className={styles.stage}>
          <span className={styles.ticketFace} style={faceStyle}>
            {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
            <img
              className={styles.ticketArt}
              src={TICKET_BASE_SRC}
              alt=""
              draggable={false}
            />
            <span className={styles.ticketContent}>
              {formatComicLabelText(t("create"))}
            </span>
          </span>
        </span>
      </ComicPagePanel>

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
