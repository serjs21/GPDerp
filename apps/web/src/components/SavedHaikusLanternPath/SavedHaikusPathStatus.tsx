"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/StyledComponents";
import { FetchingLanternLoader } from "@/components/Loaders/FetchingLoader";
import type { SavedHaikusPathStatusProps } from "./SavedHaikusPathStatus.types";
import { savedHaikusPathLoaderStyle } from "./utils/savedHaikusPathUtils";
import styles from "@/components/Lantern/LanternPath/LanternPath.module.css";

/** Initial load / search loader, or the load error with a retry button. */
export function SavedHaikusPathStatus({ phase, onRetry }: SavedHaikusPathStatusProps) {
  const t = useTranslations("SavedHaikusLanternPath");

  if (phase === "error") {
    return (
      <div className={styles.flightPathError}>
        <p>{t("loadError")}</p>
        <Button type="primary" onClick={onRetry}>
          {t("retry")}
        </Button>
      </div>
    );
  }

  return (
    <div
      className={styles.flightPathLoader}
      style={savedHaikusPathLoaderStyle()}
      aria-busy="true"
      aria-label={t(phase === "loading" ? "loading" : "searching")}
    >
      <FetchingLanternLoader />
    </div>
  );
}
