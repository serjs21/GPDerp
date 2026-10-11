"use client";

import { ComicPagePanel } from "@/components/ComicPageLayout";
import { ComicPressButton } from "@/components/ComicPressButton";
import { withDefaults } from "@/utils/props/withDefaults";
import { LabelActionIcon } from "./LabelActionIcon";
import type { LabelActionButtonProps } from "./LabelActionButton.types";
import {
  captionPlacement,
  hoverFillStyle,
  labelActionClassName,
  rowLayoutClass,
} from "./utils/labelActionUtils";
import styles from "./LabelActions.module.css";

const LABEL_ACTION_BUTTON_DEFAULTS = {
  disabled: false,
  invertIconOnHover: false,
  background: "solid",
  color: "white",
  inkOnSkyIcon: false,
} as const;

/** One stacked comic-panel action (icon with an optional caption before or after it). */
export function LabelActionButton(props: LabelActionButtonProps) {
  const { layout, caption, disabled, invertIconOnHover, background, color, inkOnSkyIcon } = withDefaults(
    props,
    LABEL_ACTION_BUTTON_DEFAULTS,
  );
  const selected = props.selected ?? !disabled;
  const placement = captionPlacement(layout, caption);
  const captionEl = (
    <span className={[styles.caption, props.captionClassName].filter(Boolean).join(" ")} aria-hidden>
      {caption}
    </span>
  );

  return (
    <ComicPressButton
      className={styles.pressShell}
      aria-label={props.ariaLabel}
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        props.onSelect();
      }}
    >
      <ComicPagePanel
        background={background}
        color={color}
        flexWeight={1}
        contentAlign="start"
        isMotionBackground={false}
        className={labelActionClassName({ selected, disabled, invertIconOnHover, inkOnSkyIcon, layout })}
        style={hoverFillStyle(props.hoverFill)}
      >
        <div className={[styles.row, rowLayoutClass(layout)].join(" ")}>
          {placement === "before" ? captionEl : null}
          <LabelActionIcon src={props.src} iconClassName={props.iconClassName} inkOnSky={inkOnSkyIcon} />
          {placement === "after" ? captionEl : null}
        </div>
      </ComicPagePanel>
    </ComicPressButton>
  );
}
