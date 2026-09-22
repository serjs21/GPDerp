"use client";

import type { CSSProperties } from "react";
import { ComicPagePanel } from "@/components/ComicPageLayout";
import styles from "./LabelActions.module.css";

const TUNE_IN_SRC = "/profile/label_actions/tune_in.svg";
const EDIT_SRC = "/profile/label_actions/edit.svg";
const DELETE_SRC = "/profile/label_actions/delete.svg";

const DELETE_HOVER = "var(--accent-red, #aa1f3f)";

export type LabelActionsProps = {
  labelName: string;
  /** When false, Tune in is disabled (no connected lanterns). */
  hasConnections: boolean;
  onTuneIn: () => void;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
};

type ActionButtonProps = {
  src: string;
  ariaLabel: string;
  onSelect: () => void;
  disabled?: boolean;
  hoverFill?: string;
  invertIconOnHover?: boolean;
};

function LabelActionButton({
  src,
  ariaLabel,
  onSelect,
  disabled = false,
  hoverFill,
  invertIconOnHover = false,
}: ActionButtonProps) {
  const style = (
    hoverFill
      ? { "--label-action-hover-fill": hoverFill }
      : undefined
  ) as CSSProperties | undefined;

  return (
    <ComicPagePanel
      selectable
      selected={!disabled}
      background="solid"
      color="white"
      flexWeight={1}
      className={[
        styles.action,
        invertIconOnHover ? styles.invertIconOnHover : "",
        disabled ? styles.disabled : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      ariaLabel={ariaLabel}
      onSelect={() => {
        if (disabled) return;
        onSelect();
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
      <img className={styles.icon} src={src} alt="" draggable={false} decoding="async" />
    </ComicPagePanel>
  );
}

/**
 * Stacked comic panel actions for a manage-label row:
 * Tune in → Edit → Delete.
 */
export function LabelActions({
  labelName,
  hasConnections,
  onTuneIn,
  onEdit,
  onDelete,
  className,
}: LabelActionsProps) {
  return (
    <div
      className={[styles.stack, className].filter(Boolean).join(" ")}
      role="group"
      aria-label={`Actions for ${labelName}`}
    >
      <LabelActionButton
        src={TUNE_IN_SRC}
        ariaLabel={
          hasConnections
            ? `Tune in to haikus labeled ${labelName}`
            : `No haikus labeled ${labelName}`
        }
        onSelect={onTuneIn}
        disabled={!hasConnections}
      />
      <LabelActionButton
        src={EDIT_SRC}
        ariaLabel={`Edit ${labelName}`}
        onSelect={onEdit}
      />
      <LabelActionButton
        src={DELETE_SRC}
        ariaLabel={`Delete ${labelName}`}
        onSelect={onDelete}
        hoverFill={DELETE_HOVER}
        invertIconOnHover
      />
    </div>
  );
}
