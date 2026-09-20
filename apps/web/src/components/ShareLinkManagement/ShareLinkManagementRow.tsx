"use client";

import type { CSSProperties } from "react";
import type { ShareLinkListItem } from "@/api/shareLinks";
import type { HaikuDto } from "@/api/haikus";
import { ComicPagePanel } from "@/components/ComicPageLayout";
import { Lantern } from "@/components/Lantern/Lantern";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import { buildPreviewLanternTypographyStyle } from "@/components/Lantern/utils/previewLanternTypography";
import { SakuraPetalLoader } from "@/components/Loaders";
import { OverlayTitle } from "@/components/OverlayTitle";
import { Sway } from "@/components/Sway";
import shareStyles from "@/components/ShareLink/ShareLink.module.css";
import { ShareLinkSettingsControls } from "@/components/ShareLink/ShareLinkSettingsControls";
import {
  CLOCK_SRC,
  HEART_FILLED_SRC,
  HEART_SRC,
  INFINITY_SRC,
  useShareLinkControls,
} from "@/components/ShareLink/useShareLinkControls";
import type { HitsMeterDisplay, TimeMeterDisplay } from "@/utils/shareLinkDisplay";
import styles from "./ShareLinkManagement.module.css";

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
          <span className={styles.previewStatValue}>{hits.count}</span>
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
  const ctrl = useShareLinkControls({
    link,
    haikuId: link.sharedHaikuId ?? "",
    haikuSubject: link.haikuSubject,
    onChanged,
  });

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

  const lanternPanel = (
    <ComicPagePanel
      background="halftone"
      color="sky"
      title={lanternStats}
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
    <div className={styles.linkRow}>
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
            stopButtonClassName={shareStyles.stopButton}
            restartReason={ctrl.restartReason}
          />
        </div>
      </ComicPagePanel>
    </div>
  );
}
