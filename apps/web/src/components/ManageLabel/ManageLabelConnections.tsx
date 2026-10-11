"use client";

import { useTranslations } from "next-intl";
import { ComicPressButton } from "@/components/ComicPressButton";
import { OverlayTitle } from "@/components/OverlayTitle";
import { ConnectedHaikusPanel } from "./ConnectedHaikusPanel";
import type { ManageLabelConnectionsProps } from "./ManageLabelConnections.types";
import styles from "./ManageLabel.module.css";

/** Connected-haiku preview; pressable ("tune in") only when the label has haikus. */
export function ManageLabelConnections({
  accountId,
  labelName,
  items,
  total,
  hasConnections,
  onTuneIn,
}: ManageLabelConnectionsProps) {
  const t = useTranslations("ManageLabel.manageLabel");
  const panel = <ConnectedHaikusPanel accountId={accountId} labelName={labelName} items={items} total={total} />;

  return (
    <div className={styles.connectedSlot}>
      {hasConnections ? (
        <OverlayTitle title={t("tuneIn")} direction="bottom">
          <ComicPressButton
            className={styles.overlayAction}
            onClick={onTuneIn}
            aria-label={t("tuneInAriaLabel", { name: labelName })}
          >
            {panel}
          </ComicPressButton>
        </OverlayTitle>
      ) : (
        panel
      )}
    </div>
  );
}
