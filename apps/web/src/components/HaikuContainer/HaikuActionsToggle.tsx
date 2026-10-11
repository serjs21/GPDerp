"use client";

import { useTranslations } from "next-intl";
import { HAIKU_ACTIONS_TOGGLE_ICON_SRC } from "./consts/haikuActionsConsts";
import type { HaikuActionsToggleProps } from "./HaikuActions.types";
import styles from "./HaikuActions.module.css";

export function HaikuActionsToggle({ wrapRef, isOpen, onToggle }: HaikuActionsToggleProps) {
  const t = useTranslations("HaikuContainer.haikuActions");
  return (
    <span ref={wrapRef} className={styles.toggleWrap}>
      <button
        type="button"
        className={styles.toggle}
        aria-label={isOpen ? t("hideActions") : t("showActions")}
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={isOpen ? HAIKU_ACTIONS_TOGGLE_ICON_SRC.open : HAIKU_ACTIONS_TOGGLE_ICON_SRC.closed}
          alt=""
          className={styles.toggleIcon}
          width={28}
          height={28}
        />
      </button>
    </span>
  );
}
