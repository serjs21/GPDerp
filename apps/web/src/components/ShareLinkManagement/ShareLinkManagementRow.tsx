"use client";

import type { ShareLinkListItem } from "@/api/shareLinks";
import type { HaikuDto } from "@/api/haikus";
import { ComicPagePanel } from "@/components/ComicPageLayout";
import { Lantern } from "@/components/Lantern/Lantern";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import { SakuraPetalLoader } from "@/components/Loaders";
import { Sway } from "@/components/Sway";
import shareStyles from "@/components/ShareLink/ShareLink.module.css";
import { ShareLinkSettingsControls } from "@/components/ShareLink/ShareLinkSettingsControls";
import { useShareLinkControls } from "@/components/ShareLink/useShareLinkControls";
import styles from "./ShareLinkManagement.module.css";

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
  const lanternContent = haiku ? (
    <Lantern haiku={haiku} showActions={false} bodyOnly />
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
    />
  );

  return (
    <div className={styles.linkRow}>
      <ComicPagePanel
        background="halftone"
        color="sky"
        title={link.haikuSubject}
        contentAlign="center"
        className={[
          styles.lanternPanel,
          ctrl.grayscale ? shareStyles.panelShellInactive : shareStyles.panelShellActive,
        ].join(" ")}
        ariaLabel={`Lantern preview for ${ctrl.subject}`}
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

      <ComicPagePanel
        background="solid"
        color="white"
        title="Settings"
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
          />
        </div>
      </ComicPagePanel>
    </div>
  );
}
