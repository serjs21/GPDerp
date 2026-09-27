"use client";

import type { CSSProperties } from "react";
import {
  ComicPagePanel,
  type ComicPanelBackground,
  type ComicPanelColor,
} from "@/components/ComicPageLayout";
import { HoverHoldCallout } from "@/components/HoverHoldCallout";
import styles from "./LabelActions.module.css";

const TUNE_IN_SRC = "/profile/label_actions/tune_in.svg";
const NOT_CONNECTED_ACTION_SRC = "/profile/label_actions/not_connected_action.svg";
const EDIT_SRC = "/profile/label_actions/edit.svg";
const DELETE_SRC = "/profile/label_actions/delete.svg";

const DELETE_HOVER = "var(--accent-red, #aa1f3f)";

const TUNE_IN_DISABLED_CALLOUT_POSITION = {
  left: "-7.5rem",
  bottom: "-1rem",
  // transform: "translate(-100%, 0%)",
  // transformOrigin: "bottom left",
} as const;

const TUNE_IN_DISABLED_MESSAGE = "There's no use in searching for me";

export type LabelActionsProps = {
  labelName: string;
  /** When false, Tune in is disabled (no connected lanterns). */
  hasConnections: boolean;
  onTuneIn: () => void;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
};

type ActionLayout = "iconEnd" | "iconStart" | "iconOnly";

type ActionButtonProps = {
  src: string;
  caption?: string;
  ariaLabel: string;
  layout: ActionLayout;
  captionClassName?: string;
  iconClassName: string;
  onSelect: () => void;
  disabled?: boolean;
  /** When omitted, mirrors `!disabled` (ComicPagePanel grayscale when false). */
  selected?: boolean;
  hoverFill?: string;
  invertIconOnHover?: boolean;
  background?: ComicPanelBackground;
  color?: ComicPanelColor;
  /** Mask the icon with `--ink-on-sky` instead of showing the raw SVG fill. */
  inkOnSkyIcon?: boolean;
};

function rowLayoutClass(layout: ActionLayout): string {
  if (layout === "iconStart") return styles.iconStart;
  if (layout === "iconOnly") return styles.iconOnly;
  return styles.iconEnd;
}

function LabelActionButton({
  src,
  caption,
  ariaLabel,
  layout,
  captionClassName,
  iconClassName,
  onSelect,
  disabled = false,
  selected,
  hoverFill,
  invertIconOnHover = false,
  background = "solid",
  color = "white",
  inkOnSkyIcon = false,
}: ActionButtonProps) {
  const isSelected = selected ?? !disabled;
  const style = (
    hoverFill
      ? { "--label-action-hover-fill": hoverFill }
      : undefined
  ) as CSSProperties | undefined;

  const icon = inkOnSkyIcon ? (
    <span
      className={[styles.icon, styles.iconInkOnSky, iconClassName].join(" ")}
      style={{ "--label-action-icon-mask": `url("${src}")` } as CSSProperties}
      aria-hidden
    />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element -- static public SVG
    <img
      className={[styles.icon, iconClassName].join(" ")}
      src={src}
      alt=""
      draggable={false}
      decoding="async"
    />
  );

  const content =
    layout === "iconOnly" || !caption ? (
      icon
    ) : layout === "iconStart" ? (
      <>
        {icon}
        <span
          className={[styles.caption, captionClassName].filter(Boolean).join(" ")}
          aria-hidden
        >
          {caption}
        </span>
      </>
    ) : (
      <>
        <span
          className={[styles.caption, captionClassName].filter(Boolean).join(" ")}
          aria-hidden
        >
          {caption}
        </span>
        {icon}
      </>
    );

  return (
    <ComicPagePanel
      selectable
      selected={isSelected}
      background={background}
      color={color}
      flexWeight={1}
      contentAlign="start"
      isMotionBackground={false}
      className={[
        styles.action,
        invertIconOnHover ? styles.invertOnHover : "",
        disabled ? styles.disabled : "",
        disabled && inkOnSkyIcon ? styles.disabledPreserveBg : "",
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
      <div className={[styles.row, rowLayoutClass(layout)].join(" ")}>{content}</div>
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
  const tuneInButton = (
    <LabelActionButton
      src={hasConnections ? TUNE_IN_SRC : NOT_CONNECTED_ACTION_SRC}
      caption={hasConnections ? "Tune in" : undefined}
      layout={hasConnections ? "iconEnd" : "iconOnly"}
      color={hasConnections ? "#9fa1ff" : "sky"}
      background={hasConnections ? "solid" : "sunburst"}
      captionClassName={hasConnections ? styles.captionTuneIn : undefined}
      iconClassName={
        hasConnections ? styles.iconTuneIn : styles.iconNotConnected
      }
      inkOnSkyIcon={!hasConnections}
      selected
      ariaLabel={
        hasConnections
          ? `Tune in to haikus labeled ${labelName}`
          : `No haikus labeled ${labelName}`
      }
      onSelect={onTuneIn}
      disabled={!hasConnections}
      hoverFill={"#738aff"}
    />
  );

  return (
    <div
      className={[styles.stack, className].filter(Boolean).join(" ")}
      role="group"
      aria-label={`Actions for ${labelName}`}
    >
      {hasConnections ? (
        tuneInButton
      ) : (
        <HoverHoldCallout
          className={styles.tuneInCallout}
          holdMs={3000}
          fadeMs={200}
          
          position={TUNE_IN_DISABLED_CALLOUT_POSITION}
          callout={
            <div className={styles.speechBubble}>{TUNE_IN_DISABLED_MESSAGE}</div>
          }
          calloutClassName={styles.speechBubbleSlot}
        >
          {tuneInButton}
        </HoverHoldCallout>
      )}
      <LabelActionButton
        src={EDIT_SRC}
        caption="Edit"
        layout="iconStart"
        color="#c0ffc3"
        captionClassName={styles.captionEdit}
        iconClassName={styles.iconEdit}
        ariaLabel={`Edit ${labelName}`}
        onSelect={onEdit}
        hoverFill={"#6dfe73"}
      />
      <LabelActionButton
        src={DELETE_SRC}
        caption="Delete"
        layout="iconEnd"
        captionClassName={styles.captionDelete}
        color="#ffaea8"
        iconClassName={styles.iconDelete}
        ariaLabel={`Delete ${labelName}`}
        onSelect={onDelete}
        hoverFill={DELETE_HOVER}
        invertIconOnHover
      />
    </div>
  );
}
