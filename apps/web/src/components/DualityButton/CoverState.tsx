"use client";

import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
} from "react";
import {
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
  /** CoverLabel morph duration (ms). CoverIcon exit is fixed at 1.5s. */
  labelMorphMs?: number;
  /** Round CoverIcon label fill. Defaults to paper white. */
  coverBackgroundColor?: string;
  className?: string;
  style?: CSSProperties;
  /** Accessible name for the cover control. Defaults to `Reveal {title}`. */
  coverAriaLabel?: string;
} & Omit<DualityButtonProps, "className" | "style" | "showDirection">;

/**
 * Duality face with CoverIcon (same-size disk; exits with magic.css rotateRight)
 * and CoverLabel (title↔arrow rotateX flip in the direction slot).
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
    setOpening(true);
  };

  const rootStyle = {
    ...style,
    "--duality-face-size": `${sizeRem}rem`,
  } as CSSProperties;

  const coverActive = !uncovered && iconMounted;
  const labelExpanded = opening || uncovered || !iconMounted;

  return (
    <div
      className={[styles.shell, className].filter(Boolean).join(" ")}
      style={rootStyle}
    >
      <DualityButton
        {...dualityProps}
        className={[styles.face, coverActive ? styles.faceInert : ""]
          .filter(Boolean)
          .join(" ")}
        disabled={disabled}
        showDirection={false}
        aria-label={ariaLabel}
      />

      {labelMounted ? (
        <CoverLabel
          title={title}
          expanded={labelExpanded}
          uncoverMs={labelMorphMs}
        />
      ) : null}

      {iconMounted ? (
        <CoverIcon
          iconSrc={iconSrc}
          backgroundColor={coverBackgroundColor}
          dismissing={opening || uncovered}
          onDismissComplete={opening ? onOpenComplete : undefined}
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
