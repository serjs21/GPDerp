"use client";

import { useTranslations } from "next-intl";
import { HAIKU_ACTIONS } from "./consts/haikuActionsConsts";
import { HaikuActionSlotFace } from "./HaikuActionSlotFace";
import type { HaikuActionButtonsProps } from "./HaikuActions.types";
import { panelHoverClass } from "./utils/haikuActionsUtils";
import styles from "./HaikuActions.module.css";

/** Delete / share / label / copy buttons; the hovered action tints the panel and reveals its name. */
export function HaikuActionButtons({ activeHover, onHover, onFocusHover, onBlur, onAction }: HaikuActionButtonsProps) {
  const t = useTranslations("HaikuContainer.haikuActions");
  return (
    <div className={styles.shell}>
      <div
        className={[styles.panel, panelHoverClass(styles, activeHover)].filter(Boolean).join(" ")}
        role="group"
        aria-label={t("groupAriaLabel")}
      >
        {HAIKU_ACTIONS.map((action) => (
          <div key={action.id} className={`${styles.slot} ${styles[action.slotClassKey]}`}>
            <button
              type="button"
              className={styles.panelButton}
              aria-label={t(action.ariaLabel)}
              onMouseEnter={() => onHover(action.id)}
              onFocus={(event) => onFocusHover(action.id, event.currentTarget)}
              onBlur={onBlur}
              onClick={() => onAction(action.id)}
            >
              <HaikuActionSlotFace>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={action.iconSrc} alt="" className={styles.iconImg} width={18} height={18} />
              </HaikuActionSlotFace>
              <HaikuActionSlotFace enterFrom={action.enterFrom} hidden={activeHover !== action.id}>
                <span className={styles.actionName}>{t(action.label)}</span>
              </HaikuActionSlotFace>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
