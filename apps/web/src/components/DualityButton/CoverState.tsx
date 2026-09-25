"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { COVER_TITLE_ARC_D } from "./consts/coverStateConsts";
import {
  DUALITY_BUTTON_SIZE_REM,
  DUALITY_COVER_UNCOVER_MS,
} from "./consts/dualityButtonConsts";
import styles from "./CoverState.module.css";
import {
  DualityButton,
  type DualityButtonProps,
} from "./DualityButton";
import { useCoverStateUncover } from "./useCoverStateUncover";

export type CoverStateProps = {
  /** Cover glyph (e.g. `/sort_button/time_cover.svg`). */
  iconSrc: string;
  /** Curved label along the top of the cover disk. */
  title: string;
  /** Controlled uncovered state. */
  uncovered?: boolean;
  defaultUncovered?: boolean;
  onUncoveredChange?: (uncovered: boolean) => void;
  /** Overlay slide duration (ms). */
  uncoverMs?: number;
  className?: string;
  style?: CSSProperties;
  /** Accessible name for the cover control. Defaults to `Reveal {title}`. */
  coverAriaLabel?: string;
} & Omit<DualityButtonProps, "className" | "style" | "showDirection">;

/**
 * Duality face + same-size circular cover overlay in one shell.
 * Click slides the cover straight down (clipped to the face) to reveal the button.
 */
export function CoverState({
  iconSrc,
  title,
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
  const reactId = useId();
  const arcId = `cover-arc-${reactId.replace(/:/g, "")}`;
  const isControlled = uncoveredProp != null;
  const [uncoveredInternal, setUncoveredInternal] = useState(defaultUncovered);
  const uncovered = isControlled ? uncoveredProp! : uncoveredInternal;
  const [coverMounted, setCoverMounted] = useState(!uncovered);

  const overlayRef = useRef<HTMLSpanElement>(null);
  const { run, cancel } = useCoverStateUncover(uncoverMs);

  useEffect(() => () => cancel(), [cancel]);

  useEffect(() => {
    if (!uncovered) setCoverMounted(true);
  }, [uncovered]);

  const setUncovered = (next: boolean) => {
    if (!isControlled) setUncoveredInternal(next);
    onUncoveredChange?.(next);
  };

  const finishUncover = () => {
    setUncovered(true);
    setCoverMounted(false);
  };

  const onCoverClick = () => {
    if (disabled || uncovered || !coverMounted) return;
    run(overlayRef.current, finishUncover);
  };

  const rootStyle = {
    ...style,
    "--duality-cover-uncover-ms": `${uncoverMs}ms`,
    "--duality-face-size": `${DUALITY_BUTTON_SIZE_REM}rem`,
  } as CSSProperties;

  return (
    <div
      className={[
        styles.shell,
        coverMounted ? styles.shellCovered : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={rootStyle}
    >
      <DualityButton
        {...dualityProps}
        className={[styles.face, coverMounted ? styles.faceInert : ""]
          .filter(Boolean)
          .join(" ")}
        disabled={disabled || coverMounted}
        showDirection={!coverMounted}
        aria-label={ariaLabel}
      />

      {coverMounted ? (
        <button
          type="button"
          className={styles.cover}
          aria-label={coverAriaLabel ?? `Reveal ${title}`}
          disabled={disabled}
          onClick={onCoverClick}
        >
          <span ref={overlayRef} className={styles.overlay}>
            {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
            <img
              className={styles.icon}
              src={iconSrc}
              alt=""
              draggable={false}
              decoding="async"
            />
            <span className={styles.titleLayer} aria-hidden>
              <svg
                className={styles.titleSvg}
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <path id={arcId} d={COVER_TITLE_ARC_D} fill="none" />
                </defs>
                <text className={styles.titleText}>
                  <textPath
                    href={`#${arcId}`}
                    startOffset="50%"
                    textAnchor="middle"
                  >
                    {title}
                  </textPath>
                </text>
              </svg>
            </span>
          </span>
        </button>
      ) : null}
    </div>
  );
}
