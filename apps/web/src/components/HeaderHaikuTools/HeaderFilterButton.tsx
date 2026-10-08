"use client";

import { useTranslations } from "next-intl";
import { HEADER_FILTER_ICON_SRC } from "./consts/headerToolConsts";
import type { HeaderFilterButtonProps } from "./HeaderFilterButton.types";
import { HeaderToolFace } from "./HeaderToolFace";
import { HeaderToolFrame } from "./HeaderToolFrame";
import { LabelFilterExtras } from "./LabelFilterExtras";
import { useHeaderHaikuLabelManage } from "./useHeaderHaikuLabelManage";
import { useHeaderToolHover } from "./useHeaderToolHover";
import styles from "./HeaderToolButton.module.css";

/** Header "filter haikus by labels" button; owns the active-filter chips and the filter modal. */
export function HeaderFilterButton({ className, forcedHover }: HeaderFilterButtonProps) {
  const t = useTranslations("HeaderHaikuTools.filter");
  const labels = useHeaderHaikuLabelManage();
  const { active, hide, handlers } = useHeaderToolHover(forcedHover);

  if (!labels.enabled) return null;

  return (
    <>
      <div className={[styles.anchor, className].filter(Boolean).join(" ")}>
        <HeaderToolFrame panelClassName={styles.panelFilter}>
          <button
            type="button"
            className={styles.button}
            aria-label={t("buttonAriaLabel")}
            aria-expanded={labels.modalOpen}
            disabled={!labels.canOpen}
            {...handlers}
            onClick={() => {
              hide();
              labels.setModalOpen(true);
            }}
          >
            <HeaderToolFace>
              {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
              <img src={HEADER_FILTER_ICON_SRC} alt="" className={styles.iconImg} width={22} height={28} />
            </HeaderToolFace>
            <HeaderToolFace enterFrom="left" hidden={!active}>
              <span className={styles.actionName}>{t("actionName")}</span>
            </HeaderToolFace>
          </button>
        </HeaderToolFrame>
      </div>

      <LabelFilterExtras
        labels={labels}
        onModalClose={() => {
          labels.setModalOpen(false);
          hide();
        }}
      />
    </>
  );
}
