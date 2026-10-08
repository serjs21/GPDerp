"use client";

import { useTranslations } from "next-intl";
import type { LabelConnectedHaikuPreview } from "@/api/labels";
import { ComicPagePanel } from "@/components/ComicPageLayout";
import { ConnectedLanternStack } from "./ConnectedLanternStack";
import styles from "./ManageLabel.module.css";

export type ConnectedHaikusPanelProps = {
  accountId: string;
  labelName: string;
  items: LabelConnectedHaikuPreview[];
  total: number;
};

export function ConnectedHaikusPanel({
  accountId,
  labelName,
  items,
  total,
}: ConnectedHaikusPanelProps) {
  const t = useTranslations("ManageLabel.connectedHaikus");
  const footer =
  total > 0 ? (
      <div >{t("connected", { total })}
      </div>
    ) : undefined;

  return (
    <ComicPagePanel
      background={total ? "solid" : "halftone"}
      color="sky"
      flexWeight={1}
      contentAlign="center"
      footer={footer}
      className={styles.connectedPanel}
      ariaLabel={t("ariaLabel", { name: labelName })}
    >
      <ConnectedLanternStack accountId={accountId} items={items} />
    </ComicPagePanel>
  );
}
