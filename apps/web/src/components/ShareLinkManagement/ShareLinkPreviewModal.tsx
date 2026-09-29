"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ComicPageCtaAction, ComicPageDialog, ComicPagePanel } from "@/components/ComicPageLayout";
import { CreateAddLabelsModal } from "@/components/CreateAddLabelsModal";
import { Lantern } from "@/components/Lantern/Lantern";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import { SakuraPetalLoader } from "@/components/Loaders";
import { SHARE_LINK_HAIKUS_QUERY_KEY } from "./useShareLinkHaikuEnrichment";
import type { ShareLinkPreviewModalProps } from "./ShareLinkPreviewModal.types";
import styles from "./ShareLinkPreviewModal.module.css";

export function ShareLinkPreviewModal({
  open,
  onOpenChange,
  subject,
  haiku,
  loading = false,
}: ShareLinkPreviewModalProps) {
  const queryClient = useQueryClient();
  const [labelsOpen, setLabelsOpen] = useState(false);

  return (
    <>
      <ComicPageDialog
        open={open}
        onOpenChange={onOpenChange}
        title={subject}
        showClose
        contentClassName={styles.dialog}
        ctaFooter={
          <ComicPageCtaAction
            label="Edit labels"
            disabled={!haiku}
            onClick={() => setLabelsOpen(true)}
          />
        }
      >
        <ComicPagePanel
          background="halftone"
          color="sky"
          span="full"
          className={styles.panel}
          ariaLabel={`Shared lantern: ${subject}`}
        >
          {haiku ? (
            <LanternFrame
              ariaLabel={`Haiku lantern: ${subject}`}
              className={styles.lanternFrame}
              haikuLabels={haiku.labels}
            >
              <Lantern haiku={haiku} showActions={false} bodyOnly />
            </LanternFrame>
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
          onSaved={() => {
            void queryClient.invalidateQueries({ queryKey: [SHARE_LINK_HAIKUS_QUERY_KEY] });
          }}
        />
      ) : null}
    </>
  );
}
