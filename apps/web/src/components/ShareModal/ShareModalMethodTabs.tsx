"use client";

import { useTranslations } from "next-intl";
import { ComicPanelTabs } from "@/components/ComicPanelTabs";
import type { ShareModalMethodTabsProps } from "./ShareModalMethodTabs.types";
import { ShareMethodIcon } from "./ShareMethodIcon";
import styles from "./ShareModal.module.css";

/** Link / Email method tabs at the top of the share modal. */
export function ShareModalMethodTabs({ method, onChange }: ShareModalMethodTabsProps) {
  const t = useTranslations("ShareModal.modal");
  return (
    <ComicPanelTabs
      className={styles.methodRow}
      panelClassName={styles.methodPanel}
      value={method}
      onChange={onChange}
      tabs={[
        {
          id: "link",
          panel: {
            background: "sunburst",
            color: "teal",
            title: t("linkTabTitle"),
            ariaLabel: t("linkTabAriaLabel"),
          },
          content: (
            <ShareMethodIcon
              src="/share_modal/link.svg"
              bubbleStyle="pointedArcs"
              sourceDirection="none"
              active={method === "link"}
            />
          ),
        },
        {
          id: "email",
          panel: {
            background: "halftone",
            color: "orange",
            title: t("emailTabTitle"),
            ariaLabel: t("emailTabAriaLabel"),
          },
          content: (
            <ShareMethodIcon
              src="/share_modal/email.svg"
              bubbleStyle="rectangle"
              sourceDirection="none"
              active={method === "email"}
            />
          ),
        },
      ]}
    />
  );
}
