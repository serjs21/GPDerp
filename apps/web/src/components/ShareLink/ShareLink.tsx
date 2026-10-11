"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { ShareLinkListItem } from "@/api/shareLinks";
import { haikuQueryKeys, type HaikuDto } from "@/api/haikus";
import * as shareLinksApi from "@/api/shareLinks";
import { ShareLinkPreviewLabelsActions } from "@/components/ShareLinkActions";
import { ShareLinkControlsColumn } from "@/components/ShareLinkControlsColumn";
import { ShareLinkLanternPanel } from "@/components/ShareLinkLanternPanel";
import { ShareLinkPreviewModal } from "@/components/ShareLinkPreviewModal";
import styles from "./ShareLink.module.css";
import { useShareLinkControls } from "./useShareLinkControls";
import { shareLinkApiFns, shareLinkCardClassName, shareLinkCardView } from "./utils/shareLinkCardUtils";

export { buildLimitPayload } from "./useShareLinkControls";

const CARD_CONTROLS_CLASS_NAMES = {
  column: styles.settingsColumn,
  row: styles.settingsRow,
  panel: styles.settingsPanel,
  body: styles.settingsBody,
  update: styles.settingsUpdate,
};

export type ShareLinkProps = {
  link: ShareLinkListItem | null;
  haikuId: string;
  haikuSubject: string;
  /** Saved haiku already loaded by the opener (e.g. lantern ShareModal). */
  haiku?: HaikuDto | null;
  onChanged: () => void;
  onLinkUpdate?: (link: ShareLinkListItem) => void;
  createShareLinkFn?: typeof shareLinksApi.createShareLink;
  refreshShareLinkFn?: typeof shareLinksApi.refreshShareLink;
};

/** Share modal "Link" tab: same lantern / controls components as ShareLinkManagementRow, stacked. */
export function ShareLink({
  link,
  haikuId,
  haikuSubject,
  haiku,
  onChanged,
  onLinkUpdate,
  createShareLinkFn,
  refreshShareLinkFn,
}: ShareLinkProps) {
  const ctrl = useShareLinkControls({
    link,
    haikuId,
    haikuSubject,
    onChanged,
    onLinkUpdate,
    ...shareLinkApiFns({ createShareLinkFn, refreshShareLinkFn }),
  });

  const queryClient = useQueryClient();
  const [previewOpen, setPreviewOpen] = useState(false);
  const view = shareLinkCardView(link, haikuId);
  const toggleLabels = () => void ctrl.onToggleLabels(!view.showLabels);

  return (
    <article className={shareLinkCardClassName(styles, ctrl.grayscale)}>
      <div className={styles.panelShell}>
        <ShareLinkLanternPanel
          ctrl={ctrl}
          haiku={haiku ?? null}
          fallbackId={view.lanternFallbackId}
          createdAt={view.createdAt}
          className={styles.panel}
        />
      </div>

      <ShareLinkPreviewLabelsActions
        subject={ctrl.subject}
        showLabels={view.showLabels}
        togglingLabels={ctrl.togglingLabels}
        disabled={!link}
        onPreview={() => setPreviewOpen(true)}
        onToggleLabels={toggleLabels}
      />

      <ShareLinkControlsColumn ctrl={ctrl} classNames={CARD_CONTROLS_CLASS_NAMES} />

      <ShareLinkPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        subject={ctrl.subject}
        shareUrl={view.shareUrl}
        haiku={haiku ?? undefined}
        showLabels={view.showLabels}
        togglingLabels={ctrl.togglingLabels}
        onToggleLabels={toggleLabels}
        onHaikuChanged={() => void queryClient.invalidateQueries({ queryKey: haikuQueryKeys.all })}
      />
    </article>
  );
}
