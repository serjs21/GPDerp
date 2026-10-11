"use client";

import { useTranslations } from "next-intl";
import { HoverHoldCallout } from "@/components/HoverHoldCallout";
import { LabelActionButton } from "./LabelActionButton";
import {
  DELETE_HOVER,
  DELETE_SRC,
  EDIT_SRC,
  TUNE_IN_DISABLED_CALLOUT_POSITION,
  TUNE_IN_HOVER,
  TUNE_IN_VARIANTS,
} from "./consts/labelActionConsts";
import styles from "./LabelActions.module.css";

export type LabelActionsProps = {
  labelName: string;
  /** When false, Tune in is disabled (no connected lanterns). */
  hasConnections: boolean;
  onTuneIn: () => void;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
};

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
  const t = useTranslations("ManageLabel.labelActions");
  const tuneIn = hasConnections ? TUNE_IN_VARIANTS.connected : TUNE_IN_VARIANTS.notConnected;
  const tuneInButton = (
    <LabelActionButton
      src={tuneIn.src}
      caption={tuneIn.captionKey ? t(tuneIn.captionKey) : undefined}
      layout={tuneIn.layout}
      color={tuneIn.color}
      background={tuneIn.background}
      captionClassName={tuneIn.captionClassName}
      iconClassName={tuneIn.iconClassName}
      selected
      ariaLabel={t(tuneIn.ariaKey, { name: labelName })}
      onSelect={onTuneIn}
      disabled={!hasConnections}
      hoverFill={TUNE_IN_HOVER}
    />
  );

  return (
    <div
      className={[styles.stack, className].filter(Boolean).join(" ")}
      role="group"
      aria-label={t("groupAriaLabel", { name: labelName })}
    >
      {hasConnections ? (
        tuneInButton
      ) : (
        <HoverHoldCallout
          className={styles.tuneInCallout}
          holdMs={3000}
          fadeMs={200}
          position={TUNE_IN_DISABLED_CALLOUT_POSITION}
          callout={<div className={styles.speechBubble}>{t("tuneInDisabled")}</div>}
          calloutClassName={styles.speechBubbleSlot}
        >
          {tuneInButton}
        </HoverHoldCallout>
      )}
      <LabelActionButton
        src={EDIT_SRC}
        caption={t("edit")}
        layout="iconStart"
        color="#c0ffc3"
        captionClassName={styles.captionEdit}
        iconClassName={styles.iconEdit}
        ariaLabel={t("editAriaLabel", { name: labelName })}
        onSelect={onEdit}
        hoverFill={"#6dfe73"}
      />
      <LabelActionButton
        src={DELETE_SRC}
        caption={t("delete")}
        layout="iconEnd"
        captionClassName={styles.captionDelete}
        color="#ffaea8"
        iconClassName={styles.iconDelete}
        ariaLabel={t("deleteAriaLabel", { name: labelName })}
        onSelect={onDelete}
        hoverFill={DELETE_HOVER}
        invertIconOnHover
      />
    </div>
  );
}
