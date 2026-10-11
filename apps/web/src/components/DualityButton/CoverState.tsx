"use client";

import { withDefaults } from "@/utils/props/withDefaults";
import {
  COVER_LABEL_MORPH_MS,
  DUALITY_BUTTON_FLIP_MS,
  DUALITY_BUTTON_SIZE_REM,
} from "./consts/dualityButtonConsts";
import { CoverIcon } from "./CoverIcon";
import { CoverLabel } from "./CoverLabel";
import type { CoverStateProps } from "./CoverState.types";
import { CoverStateHitButton } from "./CoverStateHitButton";
import { DualityButton } from "./DualityButton";
import { useCoverPhase } from "./useCoverPhase";
import { coverFaceClassName, coverLayerClassName, coverStateRootStyle } from "./utils/coverStateUtils";
import styles from "./CoverState.module.css";

export type { CoverStateProps } from "./CoverState.types";

const COVER_STATE_DEFAULTS = {
  sizeRem: DUALITY_BUTTON_SIZE_REM,
  defaultUncovered: false,
  labelMorphMs: COVER_LABEL_MORPH_MS,
  coverMirrored: false,
  disabled: false,
};

/**
 * CoverIcon + DualityButton stacked in one coin. Both are absolute, same size,
 * and rotate on Y together; z-index swaps at the halfway angle so the base
 * (pre-rotated rotateY(-180deg) when covered) lands upright when open.
 */
export function CoverState({
  iconSrc,
  title,
  titleFontSizeRem,
  sizeRem,
  uncovered,
  defaultUncovered,
  onUncoveredChange,
  labelMorphMs,
  coverBackgroundColor,
  coverMirrored,
  className,
  style,
  coverAriaLabel,
  disabled,
  "aria-label": ariaLabel,
  onFlippedChange,
  ...dualityProps
}: CoverStateProps) {
  const resolved = withDefaults(
    { sizeRem, defaultUncovered, labelMorphMs, coverMirrored, disabled },
    COVER_STATE_DEFAULTS,
  );
  const phase = useCoverPhase({
    uncoveredProp: uncovered,
    defaultUncovered: resolved.defaultUncovered,
    onUncoveredChange,
    flippedProp: dualityProps.flipped,
    disabled: resolved.disabled,
    onFlippedChange,
  });

  return (
    <div
      className={[styles.shell, className].filter(Boolean).join(" ")}
      style={coverStateRootStyle(style, resolved.sizeRem)}
    >
      <div className={styles.coin}>
        <div className={coverLayerClassName(styles, "base", phase)} onAnimationEnd={phase.onLayerAnimationEnd}>
          <DualityButton
            {...dualityProps}
            flipped={phase.faceFlipped}
            className={coverFaceClassName(styles, phase.faceInert)}
            disabled={resolved.disabled}
            showDirection={false}
            onFlippedChange={phase.handleFlippedChange}
            aria-label={ariaLabel}
          />
        </div>
        <div className={coverLayerClassName(styles, "icon", phase)}>
          <CoverIcon iconSrc={iconSrc} backgroundColor={coverBackgroundColor} mirrored={resolved.coverMirrored} />
        </div>
      </div>

      {phase.labelMounted ? (
        <CoverLabel
          title={title}
          expanded={phase.labelExpanded}
          sizeRem={resolved.sizeRem}
          fontSizeRem={titleFontSizeRem}
          uncoverMs={resolved.labelMorphMs}
          baseRotateDeg={phase.labelBaseRotateDeg}
          baseRotateMs={DUALITY_BUTTON_FLIP_MS}
          followBaseRotate={phase.arrowFollowsBase}
        />
      ) : null}

      {phase.coverActive ? (
        <CoverStateHitButton
          title={title}
          coverAriaLabel={coverAriaLabel}
          disabled={resolved.disabled}
          onClick={phase.onCoverClick}
        />
      ) : null}
    </div>
  );
}
