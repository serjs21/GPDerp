"use client";

import { useTranslations } from "next-intl";
import type { HeaderSearchButtonProps } from "./HeaderSearchButton.types";
import { HeaderSearchInput } from "./HeaderSearchInput";
import { HeaderToolFace } from "./HeaderToolFace";
import { HeaderToolFrame } from "./HeaderToolFrame";
import { useHeaderSearchSource } from "./useHeaderSearchSource";
import { useHeaderToolHover } from "./useHeaderToolHover";
import { headerSearchButtonClassNames } from "./utils/headerSearchButtonUtils";
import styles from "./HeaderToolButton.module.css";

/** Header search button + input: haiku titles on `/`, the active tab on `/settings`. */
export function HeaderSearchButton({ className, forcedHover }: HeaderSearchButtonProps) {
  const t = useTranslations("HeaderHaikuTools.search");
  const { view, inputRef } = useHeaderSearchSource();
  const { active, handlers } = useHeaderToolHover(forcedHover);
  if (!view) return null;

  const classNames = headerSearchButtonClassNames(view, className);

  return (
    <div className={classNames.anchor}>
      <HeaderToolFrame panelClassName={classNames.panel}>
        <button
          type="button"
          className={styles.button}
          aria-label={view.buttonAriaLabel}
          aria-expanded={view.expanded}
          {...handlers}
          onPointerDown={view.onSearchPointerDown}
          onClick={view.onSearchClick}
        >
          <HeaderToolFace>
            {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
            <img src={view.iconSrc} alt="" className={styles.iconImg} width={28} height={28} />
          </HeaderToolFace>
          {view.isSettings ? null : (
            <HeaderToolFace enterFrom="right" hidden={!active}>
              <span className={styles.actionName}>{t("actionName")}</span>
            </HeaderToolFace>
          )}
        </button>
      </HeaderToolFrame>

      {view.expanded ? <HeaderSearchInput view={view} inputRef={inputRef} /> : null}
    </div>
  );
}
