"use client";

import { useTranslations } from "next-intl";
import { NOT_CONNECTED_TITLE_SRC } from "./consts/manageLabelLayoutConsts";
import type { ManageLabelConnectionsTitleProps } from "./ManageLabelConnectionsTitle.types";
import styles from "./ManageLabel.module.css";

/** Label title caption on narrow strips: the connections count, or the not-connected mark. */
export function ManageLabelConnectionsTitle({ labelName, total }: ManageLabelConnectionsTitleProps) {
  const t = useTranslations("ManageLabel");

  if (total > 0) return <>{t("connectedHaikus.connected", { total })}</>;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- static public SVG
    <img
      src={NOT_CONNECTED_TITLE_SRC}
      alt={t("labelActions.noHaikusAriaLabel", { name: labelName })}
      className={styles.notConnectedTitleIcon}
      width={18}
      height={18}
      draggable={false}
    />
  );
}
