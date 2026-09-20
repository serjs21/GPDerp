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
  isPending: boolean;
};

export function ConnectedHaikusPanel({
  accountId,
  labelName,
  items,
  total,
  isPending,
}: ConnectedHaikusPanelProps) {
  const moreCount = Math.max(0, total - CONNECTED_PREVIEW_LIMIT);

  return (
    <ComicPagePanel
      background="halftone"
      color="sky"
      overflowVisible
      flexWeight={1}
      contentAlign="center"
      className={styles.connectedPanel}
      ariaLabel={`Haikus labeled ${labelName}`}
    >
      <div className={styles.connectedBody}>
        {isPending ? (
          <p className={styles.connectedQuiet}>Loading…</p>
        ) : items.length === 0 ? (
          <p className={styles.connectedQuiet}>No lanterns yet</p>
        ) : (
          <>
            <ConnectedLanternStack accountId={accountId} items={items} />
            {moreCount > 0 ? (
              <p className={styles.connectedMore}>{`+${moreCount} more`}</p>
            ) : null}
          </>
        )}
      </div>
    </ComicPagePanel>
  );
}
