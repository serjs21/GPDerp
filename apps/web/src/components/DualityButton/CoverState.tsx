"use client";

import {
  useCallback,
  useEffect,
  useState,
  type AnimationEvent,
  type CSSProperties,
} from "react";
import {
  COVER_ICON_EXIT_MS,
  COVER_LABEL_MORPH_MS,
  DUALITY_BUTTON_SIZE_REM,
} from "./consts/dualityButtonConsts";
import { CoverIcon } from "./CoverIcon";
import { CoverLabel } from "./CoverLabel";
import styles from "./CoverState.module.css";
import {
  DualityButton,
  type DualityButtonProps,
} from "./DualityButton";

export type CoverStateProps = {
  /** Cover glyph (e.g. `/sort_button/time_cover.svg`). */
  iconSrc: string;
  /** Title in the direction-arrow slot; morphs into the arrow on open. */
  title: string;
  /**
   * Face + CoverIcon diameter in rem. CoverIcon and DualityButton share this
   * via `--duality-face-size` (default 4.25).
   */
  sizeRem?: number;
  /** Controlled uncovered state. */
  uncovered?: boolean;
  defaultUncovered?: boolean;
  onUncoveredChange?: (uncovered: boolean) => void;
  /** CoverLabel morph duration (ms). Coin flip is fixed at COVER_ICON_EXIT_MS. */
  labelMorphMs?: number;
  /** Round CoverIcon label fill. Defaults to paper white. */
  coverBackgroundColor?: string;
  className?: string;
  style?: CSSProperties;
  /** Accessible name for the cover control. Defaults to `Reveal {title}`. */
  coverAriaLabel?: string;
} & Omit<DualityButtonProps, "className" | "style" | "showDirection">;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Duality face + CoverIcon as two sides of a coin. Open flips the coin on the
 * vertical axis so the duality base is the reverse face. CoverLabel morphs in
 * the direction-arrow slot.
 */
export function CoverState({
  iconSrc,
  title,
  sizeRem = DUALITY_BUTTON_SIZE_REM,
  uncovered: uncoveredProp,
  defaultUncovered = false,
  onUncoveredChange,
  labelMorphMs = COVER_LABEL_MORPH_MS,
  coverBackgroundColor,
  className,
  style,
  coverAriaLabel,
  disabled = false,
  "aria-label": ariaLabel,
  ...dualityProps
}: CoverStateProps) {
  const isControlled = uncoveredProp != null;
  const [uncoveredInternal, setUncoveredInternal] = useState(defaultUncovered);
  const uncovered = isControlled ? uncoveredProp! : uncoveredInternal;
  const [opening, setOpening] = useState(false);
  const [iconMounted, setIconMounted] = useState(!uncovered);
  const [labelMounted, setLabelMounted] = useState(true);

  useEffect(() => {
    if (!uncovered) {
      setOpening(false);
      setIconMounted(true);
      setLabelMounted(true);
    }
  }, [uncovered]);

  const onOpenComplete = useCallback(() => {
    if (!isControlled) setUncoveredInternal(true);
    onUncoveredChange?.(true);
    setOpening(false);
    setIconMounted(false);
    // Keep CoverLabel arrow in place — swapping to DualityButton.direction jumps position/size.
  }, [isControlled, onUncoveredChange]);

  const onCoverClick = () => {
    if (disabled || uncovered || opening) return;
    if (prefersReducedMotion()) {
      onOpenComplete();
      return;
    }
    setOpening(true);
  };

  const onCoinAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (!opening) return;
    if (event.target !== event.currentTarget) return;
    if (!event.animationName.toLowerCase().includes("covercoinflip")) return;
    onOpenComplete();
  };

  const rootStyle = {
    ...style,
    "--duality-face-size": `${sizeRem}rem`,
    "--cover-coin-flip-ms": `${COVER_ICON_EXIT_MS}ms`,
  } as CSSProperties;

  const coverActive = !uncovered && iconMounted;
  const labelExpanded = opening || uncovered || !iconMounted;

  const dualityButton = (
    <DualityButton
      {...dualityProps}
      className={[styles.face, coverActive ? styles.faceInert : ""]
        .filter(Boolean)
        .join(" ")}
      disabled={disabled}
      showDirection={false}
      aria-label={ariaLabel}
    />
  );

  return (
    <div
      className={[styles.shell, className].filter(Boolean).join(" ")}
      style={rootStyle}
    >
      {iconMounted ? (
        <div
          className={[styles.coin, opening ? styles.coinFlipping : ""]
            .filter(Boolean)
            .join(" ")}
          onAnimationEnd={onCoinAnimationEnd}
        >
          <div className={[styles.coinFace, styles.coinBack].join(" ")}>
            {dualityButton}
          </div>
          <div className={[styles.coinFace, styles.coinFront].join(" ")}>
            <CoverIcon
              iconSrc={iconSrc}
              backgroundColor={coverBackgroundColor}
            />
          </div>
        </div>
      ) : (
        dualityButton
      )}

      {labelMounted ? (
        <CoverLabel
          title={title}
          expanded={labelExpanded}
          uncoverMs={labelMorphMs}
        />
      ) : null}

      {coverActive ? (
        <button
          type="button"
          className={styles.hit}
          aria-label={coverAriaLabel ?? `Reveal ${title}`}
          disabled={disabled || opening}
          onClick={onCoverClick}
        />
      ) : null}
    </div>
  );
}
