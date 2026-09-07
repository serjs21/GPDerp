"use client";

import type { CSSProperties } from "react";
import { ComicPagePanel } from "@/components/ComicPageLayout";
import styles from "./SVGPanelActionButton.module.css";

export type SVGPanelActionButtonProps = {
  src: string;
  /** Footer caption and aria-label base. */
  label: string;
  ariaLabel?: string;
  hoverFill: string;
  onSelect: () => void;
  /** Invert the SVG to white on hover (e.g. dark icon on red wash). */
  invertIconOnHover?: boolean;
  flexWeight?: number;
  className?: string;
};

export function SVGPanelActionButton({
  src,
  label,
  ariaLabel,
  hoverFill,
  onSelect,
  invertIconOnHover = false,
  flexWeight = 1,
  className,
}: SVGPanelActionButtonProps) {
  const hoverStyle = {
    "--svg-panel-action-hover-fill": hoverFill,
  } as CSSProperties;

  return (
    <ComicPagePanel
      selectable
      selected
      background="solid"
      color="white"
      flexWeight={flexWeight}
      className={[
        styles.actionPanel,
        invertIconOnHover ? styles.invertIconOnHover : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={hoverStyle}
      ariaLabel={ariaLabel ?? label}
      onSelect={onSelect}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG asset */}
      <img className={styles.actionIcon} src={src} alt="" draggable={false} />
      <span className={styles.actionFooter} aria-hidden>
        {label}
      </span>
    </ComicPagePanel>
  );
}
