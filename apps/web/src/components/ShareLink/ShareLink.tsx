"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState, type CSSProperties } from "react";
import type { ShareLinkListItem } from "@/api/shareLinks";
import { haikuQueryKeys, type HaikuDto } from "@/api/haikus";
import * as shareLinksApi from "@/api/shareLinks";
import { ComicPagePanel } from "@/components/ComicPageLayout";
import {
  ShareLinkPreviewLabelsActions,
  ShareLinkUpdateAction,
} from "@/components/ShareLinkActions";
import { ShareLinkPreviewModal } from "@/components/ShareLinkPreviewModal";
import { MfgDate } from "@/components/MfgDate";
import { Lantern } from "@/components/Lantern/Lantern";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import { buildPreviewLanternTypographyStyle } from "@/components/Lantern/utils/previewLanternTypography";
import { OverlayTitle } from "@/components/OverlayTitle";
import { Sway } from "@/components/Sway";
import managementStyles from "@/components/ShareLinkManagement/ShareLinkManagement.module.css";
import type { HitsMeterDisplay, TimeMeterDisplay } from "@/utils/shareLinkDisplay";
import styles from "./ShareLink.module.css";
import { ShareLinkLifecycleAction } from "./ShareLinkLifecycleAction";
import { ShareLinkSettingsControls } from "./ShareLinkSettingsControls";
import {
  CLOCK_SRC,
  HEART_FILLED_SRC,
  HEART_SRC,
  INFINITY_SRC,
  useShareLinkControls,
} from "./useShareLinkControls";

export { buildLimitPayload } from "./useShareLinkControls";

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
    <div className={managementStyles.previewStats} aria-label="Share link stats">
      <span className={managementStyles.previewStat} aria-label={hitsLabel}>
        {/* eslint-disable-next-line @next/next/no-img-element -- pixel meter icons */}
        <img
          src={hits.kind === "empty" ? HEART_SRC : HEART_FILLED_SRC}
          alt=""
          className={managementStyles.previewStatIcon}
          aria-hidden
        />
        {hits.kind === "unlimited" ? (
          // eslint-disable-next-line @next/next/no-img-element -- pixel meter icons
          <img
            src={INFINITY_SRC}
            alt=""
            className={managementStyles.previewStatIcon}
            aria-hidden
          />
        ) : (
          <span className={managementStyles.previewStatValue}>
            {hits.count}/{hits.total}
          </span>
        )}
      </span>
      <span className={managementStyles.previewStat} aria-label={timeLabel}>
        {/* eslint-disable-next-line @next/next/no-img-element -- pixel meter icons */}
        <img
          src={CLOCK_SRC}
          alt=""
          className={managementStyles.previewStatIcon}
          aria-hidden
        />
        {time.kind === "unlimited" ? (
          // eslint-disable-next-line @next/next/no-img-element -- pixel meter icons
          <img
            src={INFINITY_SRC}
            alt=""
            className={managementStyles.previewStatIcon}
            aria-hidden
          />
        ) : (
          <span className={managementStyles.previewStatValue}>{time.text}</span>
        )}
      </span>
    </div>
  );
}

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

export function ShareLink({
  link,
  haikuId,
  haikuSubject,
  haiku = null,
  onChanged,
  onLinkUpdate,
  createShareLinkFn = shareLinksApi.createShareLink,
  refreshShareLinkFn = shareLinksApi.refreshShareLink,
}: ShareLinkProps) {
  const ctrl = useShareLinkControls({
    link,
    haikuId,
    haikuSubject,
    onChanged,
    onLinkUpdate,
    createShareLinkFn,
    refreshShareLinkFn,
  });

  const queryClient = useQueryClient();
  const [previewOpen, setPreviewOpen] = useState(false);
  const showLabels = link?.showLabels ?? false;

  const previewBody = haiku?.body ?? "";
  const createdAt = haiku?.createdAt ?? link?.createdAt ?? null;
  const lanternStats = ctrl.active ? (
    <PreviewLanternStats
      hits={ctrl.hits}
      time={ctrl.time}
      hitsLabel={ctrl.hitsLabel}
      timeLabel={ctrl.timeLabel}
    />
  ) : undefined;
  const previewFooter = createdAt ? <MfgDate date={createdAt} /> : undefined;

  const lanternContent = haiku ? (
    <Lantern
      haiku={haiku}
      showActions={false}
      bodyOnly
      className={managementStyles.previewLantern}
      style={previewLanternBodyStyle(previewBody, haiku.title)}
    />
  ) : (
    <Lantern
      haiku={{
        id: haikuId || link?.sharedHaikuId || link?.id || "share-link-preview",
        title: ctrl.subject,
        titleSuffix: 0,
        body: "",
        createdAt: link?.createdAt ?? new Date().toISOString(),
        accountId: "",
        createdById: "",
        labels: [],
      }}
      showActions={false}
      bodyOnly
      className={managementStyles.previewLantern}
    />
  );

  const lanternPanel = (
    <ComicPagePanel
      span="full"
      background="halftone"
      color="sky"
      title={lanternStats}
      footer={previewFooter}
      contentAlign="center"
      className={[
        managementStyles.lanternPanel,
        styles.panel,
        ctrl.grayscale ? styles.panelShellInactive : styles.panelShellActive,
      ].join(" ")}
      ariaLabel={`Share link for ${ctrl.subject}`}
    >
      <div className={managementStyles.lanternWrap}>
        <Sway
          className={managementStyles.lanternSway}
          disabled={!ctrl.active}
          speed={4.6}
          amplitude={3.25}
        >
          <LanternFrame
            ariaLabel={`Haiku lantern: ${ctrl.subject}`}
            className={managementStyles.lanternFrame}
            widthRem={9}
          >
            {lanternContent}
          </LanternFrame>
        </Sway>
      </div>
    </ComicPagePanel>
  );

  return (
    <article
      className={[styles.root, styles.card, ctrl.grayscale ? styles.cardInactive : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={[
          styles.panelShell,
          managementStyles.lanternSlot,
        ].join(" ")}
      >
        {ctrl.copyEnabled ? (
          <OverlayTitle
            title="Copy link!"
            direction="bottom"
            className={managementStyles.lanternSlot}
          >
            <button
              type="button"
              className={managementStyles.lanternCopy}
              onClick={ctrl.onCopy}
              aria-label={`Copy share link for ${ctrl.subject}`}
            >
              {lanternPanel}
            </button>
          </OverlayTitle>
        ) : (
          lanternPanel
        )}
      </div>

      <ShareLinkPreviewLabelsActions
        subject={ctrl.subject}
        showLabels={showLabels}
        togglingLabels={ctrl.togglingLabels}
        disabled={!link}
        onPreview={() => setPreviewOpen(true)}
        onToggleLabels={() => void ctrl.onToggleLabels(!showLabels)}
      />

      <div className={`${managementStyles.settingsColumn} ${styles.settingsColumn}`}>
        <div className={`${managementStyles.settingsRow} ${styles.settingsRow}`}>
          <ComicPagePanel
            background="solid"
            color="white"
            contentAlign="start"
            className={`${managementStyles.settingsPanel} ${styles.settingsPanel}`}
            ariaLabel={`Share link settings for ${ctrl.subject}`}
          >
            <div className={`${managementStyles.settingsBody} ${styles.settingsBody}`}>
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
          <div className={`${managementStyles.settingsUpdate} ${styles.settingsUpdate}`}>
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
          stopButtonClassName={styles.stopButton}
          restartReason={ctrl.restartReason}
        />
      </div>

      <ShareLinkPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        subject={ctrl.subject}
        haiku={haiku ?? undefined}
        showLabels={showLabels}
        togglingLabels={ctrl.togglingLabels}
        onToggleLabels={() => void ctrl.onToggleLabels(!showLabels)}
        onHaikuChanged={() => void queryClient.invalidateQueries({ queryKey: haikuQueryKeys.all })}
      />
    </article>
  );
}
