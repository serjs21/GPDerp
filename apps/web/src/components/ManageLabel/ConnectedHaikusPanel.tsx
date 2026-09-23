"use client";

import type { LabelConnectedHaikuPreview } from "@/api/labels";
import { ComicPagePanel } from "@/components/ComicPageLayout";
import { ConnectedLanternStack } from "./ConnectedLanternStack";
import styles from "./ManageLabel.module.css";

const CONNECTED_PREVIEW_LIMIT = 3;

export type ConnectedHaikusPanelProps = {
  accountId: string;
  labelName: string;
  items: LabelConnectedHaikuPreview[];
  total: number;
};

export function ConnectedHaikusPanel({
  accountId,
  labelName,
  items,
  total,
}: ConnectedHaikusPanelProps) {
  const moreCount = Math.max(0, total - CONNECTED_PREVIEW_LIMIT);
  const footer =
    moreCount > 0 ? (
      <div className={styles.connectedBody}>
        <p className={styles.connectedMore}>{`+${moreCount} more`}</p>
      </div>
    ) : undefined;

  return (
    <ComicPagePanel
      background={total ? "solid" : "halftone"}
      color="sky"
      flexWeight={1}
      contentAlign="center"
      footer={footer}
      className={styles.connectedPanel}
      ariaLabel={`Haikus labeled ${labelName}`}
    >
      <ConnectedLanternStack accountId={accountId} items={items} />
    </ComicPagePanel>
  );
}
