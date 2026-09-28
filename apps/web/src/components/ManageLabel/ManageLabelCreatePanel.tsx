"use client";

import { useState } from "react";
import type { LabelDto } from "@/api/labels";
import { formatComicLabelText } from "@/components/ComicBurstLabel/formatComicLabelText";
import { ComicLabelCreationModal } from "@/components/ComicLabelCreationModal";
import { ComicPagePanel } from "@/components/ComicPageLayout";
import styles from "./ManageLabelCreatePanel.module.css";

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
  const [open, setOpen] = useState(false);

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
        ariaLabel="Create new label"
        className={styles.panel}
      >
        <span className={styles.stage}>
          <span className={styles.ticketFace}>
            {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
            <img
              className={styles.ticketArt}
              src="/create_label_button_base/label_ticket_base.svg"
              alt=""
              draggable={false}
            />
            <span className={styles.ticketContent}>
              {formatComicLabelText("Create")}
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
