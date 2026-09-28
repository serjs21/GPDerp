"use client";

import { useState } from "react";
import type { LabelDto } from "@/api/labels";
import { formatComicLabelText } from "@/components/ComicBurstLabel/formatComicLabelText";
import { ComicLabelCreationModal } from "@/components/ComicLabelCreationModal";
import styles from "./ManageLabelCreatePanel.module.css";

export type ManageLabelCreatePanelProps = {
  accountId: string;
  onCreated?: (label: LabelDto) => void | Promise<void>;
  /** Ticket rotated 90deg clockwise (side-panel column). */
  vertical?: boolean;
  /** Stretch the ticket to fill the parent's width and height. */
  stretch?: boolean;
  className?: string;
};

export function ManageLabelCreatePanel({
  accountId,
  onCreated,
  vertical = false,
  stretch = false,
  className,
}: ManageLabelCreatePanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <article
      className={[
        styles.root,
        vertical ? styles.rootVertical : "",
        stretch ? styles.rootStretch : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        className={styles.ticket}
        aria-label="Create new label"
        onClick={() => setOpen(true)}
      >
        <span className={styles.ticketFace}>
          {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
          <img
            className={styles.ticketArt}
            src="/label_ticket_base.svg"
            alt=""
            draggable={false}
          />
          <span className={styles.ticketContent}>
            <span className={styles.ticketText}>
              {formatComicLabelText("Create new")}
            </span>
          </span>
        </span>
      </button>

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
