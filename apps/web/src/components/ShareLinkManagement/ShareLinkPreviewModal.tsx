"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { ComicPageDialog, ComicPagePanel } from "@/components/ComicPageLayout";
import { CreateAddLabelsModal } from "@/components/CreateAddLabelsModal";
import { LabelHalo, toLabelHaloItems } from "@/components/LabelHalo";
import { Lantern } from "@/components/Lantern/Lantern";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import { SakuraPetalLoader } from "@/components/Loaders";
import {
  ShareLinkEditLabelsAction,
  ShareLinkGoToLinkAction,
  ShareLinkLabelsToggle,
} from "@/components/ShareLinkActions";
import { useHaikuLabelPlacement } from "@/hooks/useHaikuLabelPlacement";
import { SHARE_LINK_HAIKUS_QUERY_KEY } from "./useShareLinkHaikuEnrichment";
import { shareLinkPreviewPanelStyle } from "./utils/shareLinkPreviewModalUtils";
import type { ShareLinkPreviewModalProps } from "./ShareLinkPreviewModal.types";
import styles from "./ShareLinkPreviewModal.module.css";

export function ShareLinkPreviewModal({
  open,
  onOpenChange,
  subject,
  shareUrl,
  haiku,
  loading = false,
  showLabels,
  togglingLabels,
  onToggleLabels,
}: ShareLinkPreviewModalProps) {
  const queryClient = useQueryClient();
  const [labelsOpen, setLabelsOpen] = useState(false);

  const refreshHaiku = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: [SHARE_LINK_HAIKUS_QUERY_KEY] });
  }, [queryClient]);

  const { onPlacementCommit } = useHaikuLabelPlacement({
    haikuId: haiku?.id,
    enabled: Boolean(haiku),
    onChanged: refreshHaiku,
  });

  const haloLabels = useMemo(() => toLabelHaloItems(haiku?.labels ?? []), [haiku?.labels]);

  return (
    <>
      <ComicPageDialog
        open={open}
        onOpenChange={onOpenChange}
        showClose
        className={styles.page}
        contentClassName={styles.dialog}
        ctaFooter={
          <>
            <div className={styles.footerAction}>
              <ShareLinkGoToLinkAction subject={subject} shareUrl={shareUrl} />
            </div>
            <div className={styles.footerAction}>
              <ShareLinkLabelsToggle
                subject={subject}
                showLabels={showLabels}
                togglingLabels={togglingLabels}
                onToggleLabels={onToggleLabels}
              />
            </div>
            <div className={styles.footerAction}>
              <ShareLinkEditLabelsAction
                subject={subject}
                disabled={!haiku}
                onEditLabels={() => setLabelsOpen(true)}
              />
            </div>
          </>
        }
      >
        <ComicPagePanel
          background="solid"
          color="sky"
          span="full"
          overflowVisible
          className={styles.panel}
          style={shareLinkPreviewPanelStyle()}
          ariaLabel={`Shared lantern: ${subject}`}
        >
          {haiku ? (
            <LabelHalo
              labels={haloLabels}
              onPlacementCommit={(labelId, placement) => void onPlacementCommit(labelId, placement)}
              ariaLabel={`${subject} labels`}
              className={showLabels ? undefined : styles.labelsHidden}
            >
              <LanternFrame ariaLabel={`Haiku lantern: ${subject}`} showLabelBelt={false}>
                <Lantern haiku={haiku} showActions={false} bodyOnly />
              </LanternFrame>
            </LabelHalo>
          ) : loading ? (
            <div className={styles.loader}>
              <SakuraPetalLoader />
            </div>
          ) : (
            <p className={styles.empty}>This haiku is no longer available.</p>
          )}
        </ComicPagePanel>
      </ComicPageDialog>

      {haiku ? (
        <CreateAddLabelsModal
          open={labelsOpen}
          haiku={haiku}
          initialTab="add"
          onClose={() => setLabelsOpen(false)}
          onSaved={refreshHaiku}
        />
      ) : null}
    </>
  );
}
