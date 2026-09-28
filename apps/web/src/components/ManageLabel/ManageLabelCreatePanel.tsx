"use client";

import { useState, type CSSProperties } from "react";
import type { LabelDto } from "@/api/labels";
import { formatComicLabelText } from "@/components/ComicBurstLabel/formatComicLabelText";
import { ComicLabelCreationModal } from "@/components/ComicLabelCreationModal";
import {
  COMIC_PANEL_COLORS,
  resolveComicPanelColor,
  type ComicPanelColor,
} from "@/components/ComicPageLayout/comicPagePresets";
import styles from "./ManageLabelCreatePanel.module.css";

export type ManageLabelCreatePanelProps = {
  accountId: string;
  onCreated?: (label: LabelDto) => void | Promise<void>;
  /** Ticket fill. */
  color?: ComicPanelColor;
  /** Ticket rotated 90deg clockwise (side-panel column). */
  vertical?: boolean;
  className?: string;
};

const CREATE_HOVER = COMIC_PANEL_COLORS.info.base;

export function ManageLabelCreatePanel({
  accountId,
  onCreated,
  color = "white",
  vertical = false,
  className,
}: ManageLabelCreatePanelProps) {
  const [open, setOpen] = useState(false);

  const ticketStyle = {
    "--create-ticket-fill": resolveComicPanelColor(color).base,
    "--create-ticket-hover": CREATE_HOVER,
  } as CSSProperties;

  return (
    <article
      className={[styles.root, vertical ? styles.rootVertical : "", className]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        className={styles.ticket}
        style={ticketStyle}
        aria-label="Create a new one"
        onClick={() => setOpen(true)}
      >
        <span className={styles.ticketFace}>
          <span className={styles.ticketInk} aria-hidden>
            <span className={styles.ticketShape} />
          </span>
          <span className={styles.ticketContent}>
            {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
            <img
              className={styles.createIcon}
              src="/label_modal/create.svg"
              alt=""
              draggable={false}
            />
            <span className={styles.ticketText}>
              {formatComicLabelText("Create a new one")}
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
