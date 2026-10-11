"use client";

import { useTranslations } from "next-intl";
import { SakuraPetalLoader } from "@/components/Loaders";
import { Tooltip } from "@/components/StyledComponents";
import styles from "./HaikuActions.module.css";

/** Saving placeholder while the haiku is still generating. */
export function HaikuActionsGenerating() {
  const t = useTranslations("HaikuContainer.haikuActions");
  return (
    <Tooltip title={t("saving")}>
      <span className={styles.loaderWrap}>
        <SakuraPetalLoader compact />
      </span>
    </Tooltip>
  );
}
