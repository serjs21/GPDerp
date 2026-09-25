"use client";

import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
} from "react";
import {
  DUALITY_BUTTON_SIZE_REM,
  DUALITY_COVER_UNCOVER_MS,
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
  /** Title in the direction-arrow slot; exits with rotateRight into the arrow. */
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
  uncoverMs?: number;
  className?: string;
  style?: CSSProperties;
  /** Accessible name for the cover control. Defaults to `Reveal {title}`. */
  coverAriaLabel?: string;
} & Omit<DualityButtonProps, "className" | "style" | "showDirection">;

/**
 * Duality face with CoverIcon (same-size disk over the base) and CoverLabel
 * (title exits with magic.css rotateRight; arrow flips in).
 */
export function CoverState({
  iconSrc,
  title,
  sizeRem = DUALITY_BUTTON_SIZE_REM,
  uncovered: uncoveredProp,
  defaultUncovered = false,
  onUncoveredChange,
  uncoverMs = DUALITY_COVER_UNCOVER_MS,
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

  const onMorphComplete = useCallback(() => {
    if (!isControlled) setUncoveredInternal(true);
    onUncoveredChange?.(true);
    setOpening(false);
    setIconMounted(false);
    // Hand the cue off to DualityButton.direction (rotates with the face).
    setLabelMounted(false);
  }, [isControlled, onUncoveredChange]);

  const onCoverClick = () => {
    if (disabled || uncovered || opening) return;
    setOpening(true);
  };

  const rootStyle = {
    ...style,
    "--duality-cover-uncover-ms": `${uncoverMs}ms`,
    "--duality-face-size": `${sizeRem}rem`,
    "--cover-icon-dismiss-ms": `${uncoverMs}ms`,
    "--cover-label-exit-ms": `${uncoverMs}ms`,
  } as CSSProperties;

  const coverActive = !uncovered && (iconMounted || labelMounted);
  const labelExpanded = opening || uncovered;

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
        disabled={disabled || coverActive}
        showDirection={!labelMounted}
        aria-label={ariaLabel}
      />

      {labelMounted ? (
        <CoverLabel
          title={title}
          expanded={labelExpanded}
          uncoverMs={uncoverMs}
          onMorphComplete={opening ? onMorphComplete : undefined}
        />
      ) : null}

      {iconMounted ? (
        <CoverIcon iconSrc={iconSrc} dismissing={opening || uncovered} />
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
