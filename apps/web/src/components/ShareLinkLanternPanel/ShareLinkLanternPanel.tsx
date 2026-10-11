"use client";

import { useTranslations } from "next-intl";
import { ComicPagePanel } from "@/components/ComicPageLayout";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import { MfgDate } from "@/components/MfgDate";
import { Sway } from "@/components/Sway";
import { ShareLinkCopyWrap } from "./ShareLinkCopyWrap";
import { ShareLinkLanternContent } from "./ShareLinkLanternContent";
import type { ShareLinkLanternPanelProps } from "./ShareLinkLanternPanel.types";
import { ShareLinkLanternStats } from "./ShareLinkLanternStats";
import { lanternPanelClassName, lanternPanelFooterDate } from "./utils/lanternPanelUtils";
import styles from "./ShareLinkLanternPanel.module.css";

/** Swaying share-link lantern with stats + Mfg date; click-to-copy while the link is active. */
export function ShareLinkLanternPanel({
  ctrl,
  haiku,
  loading,
  fallbackId,
  createdAt,
  className,
}: ShareLinkLanternPanelProps) {
  const t = useTranslations("ShareLinkLanternPanel");
  const footerDate = lanternPanelFooterDate(haiku, createdAt);

  const panel = (
    <ComicPagePanel
      background="halftone"
      color="sky"
      title={
        ctrl.active ? (
          <ShareLinkLanternStats
            hits={ctrl.hits}
            time={ctrl.time}
            hitsLabel={ctrl.hitsLabel}
            timeLabel={ctrl.timeLabel}
          />
        ) : undefined
      }
      footer={footerDate ? <MfgDate date={footerDate} /> : undefined}
      contentAlign="center"
      className={lanternPanelClassName(styles, ctrl.grayscale, className)}
      ariaLabel={t("panelAriaLabel", { subject: ctrl.subject })}
    >
      <div className={styles.wrap}>
        <Sway className={styles.sway} disabled={!ctrl.active} speed={4.6} amplitude={3.25}>
          <LanternFrame
            ariaLabel={t("lanternAriaLabel", { subject: ctrl.subject })}
            className={styles.frame}
            widthRem={9}
          >
            <ShareLinkLanternContent
              subject={ctrl.subject}
              haiku={haiku}
              loading={loading}
              fallbackId={fallbackId}
              createdAt={createdAt}
            />
          </LanternFrame>
        </Sway>
      </div>
    </ComicPagePanel>
  );

  if (!ctrl.copyEnabled) return panel;

  return (
    <ShareLinkCopyWrap subject={ctrl.subject} onCopy={ctrl.onCopy}>
      {panel}
    </ShareLinkCopyWrap>
  );
}
