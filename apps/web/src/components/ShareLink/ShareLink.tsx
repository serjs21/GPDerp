"use client";

import type { CSSProperties } from "react";
import type { ShareLinkListItem } from "@/api/shareLinks";
import type { HaikuDto } from "@/api/haikus";
import * as shareLinksApi from "@/api/shareLinks";
import { ComicPagePanel } from "@/components/ComicPageLayout";
import { Lantern } from "@/components/Lantern/Lantern";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import { OverlayTitle } from "@/components/OverlayTitle";
import { Sway } from "@/components/Sway";
import managementStyles from "@/components/ShareLinkManagement/ShareLinkManagement.module.css";
import { HAIKU_MAX_LINE_CHARS, parseHaikuBody } from "@/utils/parseHaikuBody";
import type { HitsMeterDisplay, TimeMeterDisplay } from "@/utils/shareLinkDisplay";
import styles from "./ShareLink.module.css";
import { ShareLinkSettingsControls } from "./ShareLinkSettingsControls";
import {
  CLOCK_SRC,
  HEART_FILLED_SRC,
  HEART_SRC,
  INFINITY_SRC,
  useShareLinkControls,
} from "./useShareLinkControls";

export { buildLimitPayload } from "./useShareLinkControls";

/** Cursive em-width so a max-length line stays on one row in the preview. */
const PREVIEW_CHAR_EM = 0.58;

function previewLanternBodyStyle(body: string) {
  const longest = Math.max(
    ...parseHaikuBody(body).lines.map((line) => line.length),
    1,
  );
  const fitChars = Math.min(HAIKU_MAX_LINE_CHARS, Math.max(longest, 8));
  return {
    "--lantern-body-font-size": `clamp(0.32rem, calc(100cqi / ${fitChars * PREVIEW_CHAR_EM}), 0.85rem)`,
  } as CSSProperties;
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
          <span className={managementStyles.previewStatValue}>{hits.count}</span>
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

  const previewBody = haiku?.body ?? "";
  const lanternContent = haiku ? (
    <Lantern
      haiku={haiku}
      showActions={false}
      bodyOnly
      className={managementStyles.previewLantern}
      style={previewLanternBodyStyle(previewBody)}
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
      title={ctrl.subject}
      footer={
        ctrl.active ? (
          <PreviewLanternStats
            hits={ctrl.hits}
            time={ctrl.time}
            hitsLabel={ctrl.hitsLabel}
            timeLabel={ctrl.timeLabel}
          />
        ) : undefined
      }
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
    <article className={styles.root}>
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
      />
    </article>
  );
}
