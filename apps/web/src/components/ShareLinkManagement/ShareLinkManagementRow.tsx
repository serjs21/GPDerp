"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useReducedMotion } from "motion/react";
import { useRef, useState, type CSSProperties } from "react";
import { deleteShareLink, type ShareLinkListItem } from "@/api/shareLinks";
import type { HaikuDto } from "@/api/haikus";
import { ComicConfirmModal } from "@/components/ComicConfirmModal";
import { ComicPagePanel } from "@/components/ComicPageLayout";
import { comicToast } from "@/components/ComicToast";
import { ShareLinkActions, ShareLinkUpdateAction } from "@/components/ShareLinkActions";
import { MfgDate } from "@/components/MfgDate";
import { Lantern } from "@/components/Lantern/Lantern";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import { buildPreviewLanternTypographyStyle } from "@/components/Lantern/utils/previewLanternTypography";
import { SakuraPetalLoader } from "@/components/Loaders";
import { OverlayTitle } from "@/components/OverlayTitle";
import { Sway } from "@/components/Sway";
import shareStyles from "@/components/ShareLink/ShareLink.module.css";
import { ShareLinkLifecycleAction } from "@/components/ShareLink/ShareLinkLifecycleAction";
import { ShareLinkSettingsControls } from "@/components/ShareLink/ShareLinkSettingsControls";
import {
  CLOCK_SRC,
  HEART_FILLED_SRC,
  HEART_SRC,
  INFINITY_SRC,
  useShareLinkControls,
} from "@/components/ShareLink/useShareLinkControls";
import { MAGIC_EXIT_COLLAPSE_MS } from "@/components/ManageLabel/consts/magicAnimationConsts";
import { useCollapseExit } from "@/hooks/useCollapseExit";
import type { HitsMeterDisplay, TimeMeterDisplay } from "@/utils/shareLinkDisplay";
import { ShareLinkPreviewModal } from "@/components/ShareLinkPreviewModal";
import { SHARE_LINK_HAIKUS_QUERY_KEY } from "./useShareLinkHaikuEnrichment";
import styles from "./ShareLinkManagement.module.css";

const DELETE_QUESTION = "Do you want to magically erase this link from existance?";

function previewLanternBodyStyle(body: string, title?: string): CSSProperties {
  return buildPreviewLanternTypographyStyle(body, {
    title,
    minBodyRem: 0.3,
    maxBodyRem: 0.72,
    maxTitleRem: 0.68,
    maxAuthorRem: 0.48,
  });
}

function PreviewLanternStats({
  hits,
  time,
  hitsLabel,
  timeLabel,
}: {
  hits: HitsMeterDisplay;
  time: TimeMeterDisplay;
  hitsLabel: string;
  timeLabel: string;
}) {
  return (
    <div className={styles.previewStats} aria-label="Share link stats">
      <span className={styles.previewStat} aria-label={hitsLabel}>
        {/* eslint-disable-next-line @next/next/no-img-element -- pixel meter icons */}
        <img
          src={hits.kind === "empty" ? HEART_SRC : HEART_FILLED_SRC}
          alt=""
          className={styles.previewStatIcon}
          aria-hidden
        />
        {hits.kind === "unlimited" ? (
          // eslint-disable-next-line @next/next/no-img-element -- pixel meter icons
          <img src={INFINITY_SRC} alt="" className={styles.previewStatIcon} aria-hidden />
        ) : (
          <span className={styles.previewStatValue}>
            {hits.count}/{hits.total}
          </span>
        )}
      </span>
      <span className={styles.previewStat} aria-label={timeLabel}>
        {/* eslint-disable-next-line @next/next/no-img-element -- pixel meter icons */}
        <img src={CLOCK_SRC} alt="" className={styles.previewStatIcon} aria-hidden />
        {time.kind === "unlimited" ? (
          // eslint-disable-next-line @next/next/no-img-element -- pixel meter icons
          <img src={INFINITY_SRC} alt="" className={styles.previewStatIcon} aria-hidden />
        ) : (
          <span className={styles.previewStatValue}>{time.text}</span>
        )}
      </span>
    </div>
  );
}

export type ShareLinkManagementRowProps = {
  link: ShareLinkListItem;
  haiku?: HaikuDto;
  haikuLoading?: boolean;
  onChanged: () => void;
};

export function ShareLinkManagementRow({
  link,
  haiku,
  haikuLoading = false,
  onChanged,
}: ShareLinkManagementRowProps) {
  const reduceMotion = useReducedMotion();
  const queryClient = useQueryClient();
  // Optimistic until the list refetch catches up (`base` stops matching the link).
  const [labelsOverride, setLabelsOverride] = useState<{ base: boolean; value: boolean } | null>(
    null,
  );
  const showLabels =
    labelsOverride && labelsOverride.base === link.showLabels
      ? labelsOverride.value
      : link.showLabels;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [exiting, setExiting] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  const ctrl = useShareLinkControls({
    link,
    haikuId: link.sharedHaikuId ?? "",
    haikuSubject: link.haikuSubject,
    onChanged,
    onLinkUpdate: (updated) =>
      setLabelsOverride({ base: link.showLabels, value: updated.showLabels }),
  });

  // Animate first: the delete socket event drops the row from cache immediately.
  const eraseLink = async () => {
    try {
      await deleteShareLink(link.id);
      comicToast.success("Share link erased");
      onChanged();
    } catch {
      setExiting(false);
      comicToast.error("Could not erase share link");
    }
  };

  useCollapseExit({
    ref: rowRef,
    exiting,
    durationMs: MAGIC_EXIT_COLLAPSE_MS,
    listGap: "var(--share-link-list-gap, 1.75rem)",
    onComplete: () => void eraseLink(),
  });

  const handleDeleteConfirm = () => {
    setDeleteOpen(false);
    if (reduceMotion) {
      void eraseLink();
      return;
    }
    setExiting(true);
  };

  const showLoader = haikuLoading;
  const previewBody = haiku?.body ?? "";
  const lanternContent = haiku ? (
    <Lantern
      haiku={haiku}
      showActions={false}
      bodyOnly
      className={styles.previewLantern}
      style={previewLanternBodyStyle(previewBody, haiku.title)}
    />
  ) : showLoader ? (
    <div className={styles.lanternLoader}>
      <SakuraPetalLoader />
    </div>
  ) : (
    <Lantern
      haiku={{
        id: link.sharedHaikuId ?? link.id,
        title: ctrl.subject,
        titleSuffix: 0,
        body: "",
        createdAt: link.createdAt,
        accountId: "",
        createdById: "",
        labels: [],
      }}
      showActions={false}
      bodyOnly
      className={styles.previewLantern}
    />
  );

  const lanternStats = ctrl.active ? (
    <PreviewLanternStats
      hits={ctrl.hits}
      time={ctrl.time}
      hitsLabel={ctrl.hitsLabel}
      timeLabel={ctrl.timeLabel}
    />
  ) : undefined;

  const createdAt = haiku?.createdAt ?? link.createdAt;
  const previewFooter = <MfgDate date={createdAt} />;

  const lanternPanel = (
    <ComicPagePanel
      background="halftone"
      color="sky"
      title={lanternStats}
      footer={previewFooter}
      contentAlign="center"
      className={[
        styles.lanternPanel,
        ctrl.grayscale ? shareStyles.panelShellInactive : shareStyles.panelShellActive,
      ].join(" ")}
    >
      <div className={styles.lanternWrap}>
        <Sway
          className={styles.lanternSway}
          disabled={!ctrl.active}
          speed={4.6}
          amplitude={3.25}
        >
          <LanternFrame
            ariaLabel={`Haiku lantern: ${ctrl.subject}`}
            className={styles.lanternFrame}
            widthRem={9}
          >
            {lanternContent}
          </LanternFrame>
        </Sway>
      </div>
    </ComicPagePanel>
  );

  return (
    <div
      ref={rowRef}
      className={[styles.linkRowShell, exiting ? styles.linkRowShellExiting : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={[
          styles.linkRow,
          ctrl.grayscale ? styles.linkRowInactive : "",
          exiting ? styles.boingOutDown : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {ctrl.copyEnabled ? (
          <OverlayTitle title="Copy link!" direction="bottom" className={styles.lanternSlot}>
            <button
              type="button"
              className={styles.lanternCopy}
              onClick={ctrl.onCopy}
              aria-label={`Copy share link for ${ctrl.subject}`}
            >
              {lanternPanel}
            </button>
          </OverlayTitle>
        ) : (
          lanternPanel
        )}

        <ShareLinkActions
          subject={ctrl.subject}
          shareUrl={link.shareUrl}
          showLabels={showLabels}
          togglingLabels={ctrl.togglingLabels}
          onPreview={() => setPreviewOpen(true)}
          onToggleLabels={() => void ctrl.onToggleLabels(!showLabels)}
          onDelete={() => setDeleteOpen(true)}
          className={styles.actionsCell}
        />

        <div className={styles.settingsColumn}>
          <div className={styles.settingsRow}>
            <ComicPagePanel
              background="solid"
              color="white"
              contentAlign="start"
              className={styles.settingsPanel}
              ariaLabel={`Share link settings for ${ctrl.subject}`}
            >
              <div className={styles.settingsBody}>
                <ShareLinkSettingsControls
                  form={ctrl.form}
                  setForm={ctrl.setForm}
                  limitsLocked={ctrl.limitsLocked}
                  formValid={ctrl.formValid}
                  showUpdate={ctrl.showUpdate}
                  updatingLimits={ctrl.updatingLimits}
                  activating={ctrl.activating}
                  deactivating={ctrl.deactivating}
                  active={ctrl.active}
                  busy={ctrl.busy}
                  isUpdating={ctrl.isUpdating}
                  busyDots={ctrl.busyDots}
                  onUpdateLimits={ctrl.onUpdateLimits}
                  onStart={ctrl.onStart}
                  onStop={ctrl.onStop}
                  restartReason={ctrl.restartReason}
                  hideUpdate
                  hideLifecycleAction
                />
              </div>
            </ComicPagePanel>
            <div className={styles.settingsUpdate}>
              <ShareLinkUpdateAction
                subject={ctrl.subject}
                active={ctrl.active}
                canUpdate={ctrl.showUpdate && ctrl.formValid}
                updating={ctrl.updatingLimits}
                onUpdate={() => void ctrl.onUpdateLimits()}
              />
            </div>
          </div>
          <ShareLinkLifecycleAction
            formValid={ctrl.formValid}
            activating={ctrl.activating}
            deactivating={ctrl.deactivating}
            active={ctrl.active}
            busy={ctrl.busy}
            isUpdating={ctrl.isUpdating}
            busyDots={ctrl.busyDots}
            onStart={ctrl.onStart}
            onStop={ctrl.onStop}
            stopButtonClassName={shareStyles.stopButton}
            restartReason={ctrl.restartReason}
          />
        </div>

        <ShareLinkPreviewModal
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          subject={ctrl.subject}
          haiku={haiku}
          loading={haikuLoading}
          showLabels={showLabels}
          togglingLabels={ctrl.togglingLabels}
          onToggleLabels={() => void ctrl.onToggleLabels(!showLabels)}
          onHaikuChanged={() =>
            void queryClient.invalidateQueries({ queryKey: [SHARE_LINK_HAIKUS_QUERY_KEY] })
          }
        />

        <ComicConfirmModal
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          question={DELETE_QUESTION}
          cancelLabel="Not yet"
          confirmLabel="Erase"
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </div>
  );
}
