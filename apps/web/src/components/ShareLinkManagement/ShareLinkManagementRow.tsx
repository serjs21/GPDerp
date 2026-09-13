"use client";

import type { ShareLinkListItem } from "@/api/shareLinks";
import { ComicPagePanel, ComicPageRow } from "@/components/ComicPageLayout";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import lanternStyles from "@/components/Lantern/Lantern.module.css";
import shareStyles from "@/components/ShareLink/ShareLink.module.css";
import { ShareLinkMeters } from "@/components/ShareLink/ShareLinkMeters";
import { ShareLinkSettingsControls } from "@/components/ShareLink/ShareLinkSettingsControls";
import { useShareLinkControls } from "@/components/ShareLink/useShareLinkControls";
import styles from "./ShareLinkManagement.module.css";

export type ShareLinkManagementRowProps = {
  link: ShareLinkListItem;
  onChanged: () => void;
};

export function ShareLinkManagementRow({ link, onChanged }: ShareLinkManagementRowProps) {
  const ctrl = useShareLinkControls({
    link,
    haikuId: link.sharedHaikuId ?? "",
    haikuSubject: link.haikuSubject,
    onChanged,
  });

  return (
    <ComicPageRow className={styles.linkRow}>
      <ComicPagePanel
        background="halftone"
        color="yellow"
        title={link.haikuSubject}
        contentAlign="center"
        className={styles.lanternPanel}
        flexWeight={0.9}
        ariaLabel={`Lantern preview for ${ctrl.subject}`}
      >
        <div className={styles.lanternWrap}>
          <LanternFrame ariaLabel={`Haiku lantern: ${ctrl.subject}`} widthRem={9}>
            <div className={lanternStyles.haikuStack}>
              <p className={lanternStyles.title}>{ctrl.subject}</p>
            </div>
          </LanternFrame>
        </div>
      </ComicPagePanel>

      <ComicPagePanel
        background="sunburst"
        sunburstHalftone={false}
        color={ctrl.active && !ctrl.activating && !ctrl.deactivating ? "orange" : "white"}
        shine={ctrl.shine}
        contentAlign="center"
        className={[
          styles.statsPanel,
          ctrl.grayscale ? shareStyles.panelShellInactive : shareStyles.panelShellActive,
        ].join(" ")}
        title="Stats"
        footer={ctrl.copyEnabled ? "Click to copy the link" : undefined}
        footerColor="info"
        flexWeight={1.1}
        ariaLabel={`Share link stats for ${ctrl.subject}`}
      >
        <ShareLinkMeters
          hits={ctrl.hits}
          time={ctrl.time}
          hitsLabel={ctrl.hitsLabel}
          timeLabel={ctrl.timeLabel}
          planePhase={ctrl.planePhase}
          planeInitial={ctrl.planeInitial}
          copyEnabled={ctrl.copyEnabled}
          onCopy={ctrl.onCopy}
          className={styles.statsBody}
        />
      </ComicPagePanel>

      <ComicPagePanel
        background="solid"
        color="white"
        title="Settings"
        contentAlign="start"
        className={styles.settingsPanel}
        flexWeight={1.25}
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
          />
        </div>
      </ComicPagePanel>
    </ComicPageRow>
  );
}
