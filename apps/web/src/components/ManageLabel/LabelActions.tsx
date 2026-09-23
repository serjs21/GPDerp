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

type ActionLayout = "iconEnd" | "iconStart";

type ActionButtonProps = {
  src: string;
  caption: string;
  ariaLabel: string;
  layout: ActionLayout;
  onSelect: () => void;
  disabled?: boolean;
  hoverFill?: string;
  invertIconOnHover?: boolean;
};

function LabelActionButton({
  src,
  caption,
  ariaLabel,
  layout,
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

  const icon = (
    // eslint-disable-next-line @next/next/no-img-element -- static public SVG
    <img className={styles.icon} src={src} alt="" draggable={false} decoding="async" />
  );
  const label = (
    <span
      className={[styles.caption, layout === "iconStart" ? styles.captionEdit : ""]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    >
      {caption}
    </span>
  );

  return (
    <ComicPagePanel
      selectable
      selected={!disabled}
      background="solid"
      color="white"
      flexWeight={1}
      contentAlign="start"
      className={[
        styles.action,
        invertIconOnHover ? styles.invertOnHover : "",
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
      <div
        className={[
          styles.row,
          layout === "iconEnd" ? styles.iconEnd : styles.iconStart,
        ].join(" ")}
      >
        {layout === "iconEnd" ? (
          <>
            {label}
            {icon}
          </>
        ) : (
          <>
            {icon}
            {label}
          </>
        )}
      </div>
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
        caption="Tune in"
        layout="iconEnd"
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
        caption="Edit"
        layout="iconStart"
        ariaLabel={`Edit ${labelName}`}
        onSelect={onEdit}
      />
      <LabelActionButton
        src={DELETE_SRC}
        caption="Delete"
        layout="iconEnd"
        ariaLabel={`Delete ${labelName}`}
        onSelect={onDelete}
        hoverFill={DELETE_HOVER}
        invertIconOnHover
      />
    </div>
  );
}
