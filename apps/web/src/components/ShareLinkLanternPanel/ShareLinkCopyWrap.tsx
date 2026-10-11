"use client";

import { useTranslations } from "next-intl";
import { ComicPressButton } from "@/components/ComicPressButton";
import { OverlayTitle } from "@/components/OverlayTitle";
import type { ShareLinkCopyWrapProps } from "./ShareLinkLanternPanel.types";
import styles from "./ShareLinkLanternPanel.module.css";

/** Click-to-copy button + "copy" overlay title around an active share-link lantern panel. */
export function ShareLinkCopyWrap({ subject, onCopy, children }: ShareLinkCopyWrapProps) {
  const t = useTranslations("ShareLinkLanternPanel");
  return (
    <OverlayTitle title={t("copyTitle")} direction="bottom" className={styles.slot}>
      <ComicPressButton className={styles.copy} onClick={onCopy} aria-label={t("copyAriaLabel", { subject })}>
        {children}
      </ComicPressButton>
    </OverlayTitle>
  );
}
