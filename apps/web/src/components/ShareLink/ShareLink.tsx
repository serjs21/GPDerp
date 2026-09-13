"use client";

import type { ShareLinkListItem } from "@/api/shareLinks";
import * as shareLinksApi from "@/api/shareLinks";
import { ComicPagePanel } from "@/components/ComicPageLayout";
import styles from "./ShareLink.module.css";
import { ShareLinkMeters } from "./ShareLinkMeters";
import { ShareLinkSettingsControls } from "./ShareLinkSettingsControls";
import { useShareLinkControls } from "./useShareLinkControls";

export { buildLimitPayload } from "./useShareLinkControls";

export type ShareLinkProps = {
  link: ShareLinkListItem | null;
  haikuId: string;
  haikuSubject: string;
  onChanged: () => void;
  onLinkUpdate?: (link: ShareLinkListItem) => void;
  createShareLinkFn?: typeof shareLinksApi.createShareLink;
  refreshShareLinkFn?: typeof shareLinksApi.refreshShareLink;
};

export function ShareLink({
  link,
  haikuId,
  haikuSubject,
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

  return (
    <article className={styles.root}>
      <div
        className={[
          styles.panelShell,
          ctrl.grayscale ? styles.panelShellInactive : styles.panelShellActive,
        ].join(" ")}
      >
        <ComicPagePanel
          span="full"
          background="sunburst"
          sunburstHalftone={false}
          color={ctrl.active && !ctrl.activating && !ctrl.deactivating ? "orange" : "white"}
          shine={ctrl.shine}
          contentAlign="center"
          className={styles.panel}
          title={ctrl.subject}
          footer={ctrl.copyEnabled ? "Click to copy the link" : undefined}
          footerColor="info"
          ariaLabel={`Share link for ${ctrl.subject}`}
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
          />
        </ComicPagePanel>
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
      />
    </article>
  );
}
