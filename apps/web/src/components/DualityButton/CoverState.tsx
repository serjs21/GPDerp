"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  COVER_ARROW_PATHS,
  COVER_TITLE_ARC_D,
} from "./consts/coverStateConsts";
import {
  DUALITY_BUTTON_SIZE_REM,
  DUALITY_COVER_UNCOVER_MS,
} from "./consts/dualityButtonConsts";
import styles from "./CoverState.module.css";
import { useCoverStateUncover } from "./useCoverStateUncover";

export type CoverStateProps = {
  /** Cover glyph (e.g. `/sort_button/time_cover.svg`). */
  iconSrc: string;
  /** Curved label seated where the direction arrow lives. */
  title: string;
  /** DualityButton (or equivalent face) revealed after uncover. */
  children: ReactNode;
  /** Controlled uncovered state. */
  uncovered?: boolean;
  defaultUncovered?: boolean;
  onUncoveredChange?: (uncovered: boolean) => void;
  /** Uncover animation length (ms). Default matches consts. */
  uncoverMs?: number;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Accessible name for the cover control. Defaults to `Reveal {title}`. */
  "aria-label"?: string;
};

/**
 * Overlay on a DualityButton: circular icon disk (face-sized) + curved title.
 * Click morphs the title into the direction arrow (anime.js draw) and drops
 * the icon disk to reveal the button underneath.
 */
export function CoverState({
  iconSrc,
  title,
  children,
  uncovered: uncoveredProp,
  defaultUncovered = false,
  onUncoveredChange,
  uncoverMs = DUALITY_COVER_UNCOVER_MS,
  disabled = false,
  className,
  style,
  "aria-label": ariaLabel,
}: CoverStateProps) {
  const reactId = useId();
  const arcId = `cover-arc-${reactId.replace(/:/g, "")}`;
  const isControlled = uncoveredProp != null;
  const [uncoveredInternal, setUncoveredInternal] = useState(defaultUncovered);
  const uncovered = isControlled ? uncoveredProp! : uncoveredInternal;
  const [coverMounted, setCoverMounted] = useState(!uncovered);

  const iconDiskRef = useRef<HTMLSpanElement>(null);
  const titleTextRef = useRef<SVGTextElement>(null);
  const arrowPathRefs = useRef<(SVGPathElement | null)[]>([]);

  const { run, cancel } = useCoverStateUncover(uncoverMs);

  useEffect(() => () => cancel(), [cancel]);

  useEffect(() => {
    if (!uncovered) {
      setCoverMounted(true);
    }
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
    run(
      {
        iconDisk: iconDiskRef.current,
        titleText: titleTextRef.current,
        arrowPaths: arrowPathRefs.current.filter(
          (node): node is SVGPathElement => node != null,
        ),
      },
      finishUncover,
    );
  };

  const rootStyle = {
    ...style,
    "--duality-cover-uncover-ms": `${uncoverMs}ms`,
    "--duality-face-size": `${DUALITY_BUTTON_SIZE_REM}rem`,
  } as CSSProperties;

  return (
    <div
      className={[styles.shell, className].filter(Boolean).join(" ")}
      style={rootStyle}
    >
      <div
        className={[
          styles.faceSlot,
          coverMounted ? styles.faceSlotInert : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden={coverMounted}
      >
        {children}
      </div>

      {coverMounted ? (
        <button
          type="button"
          className={styles.cover}
          aria-label={ariaLabel ?? `Reveal ${title}`}
          disabled={disabled}
          onClick={onCoverClick}
        >
          <span className={styles.diskSlot}>
            <span ref={iconDiskRef} className={styles.iconDisk}>
              {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
              <img
                className={styles.icon}
                src={iconSrc}
                alt=""
                draggable={false}
                decoding="async"
              />
            </span>
          </span>

          <span className={styles.titleLayer} aria-hidden>
            <svg
              className={styles.titleSvg}
              viewBox="0 0 100 72"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <path id={arcId} d={COVER_TITLE_ARC_D} fill="none" />
              </defs>
              <text ref={titleTextRef} className={styles.titleText}>
                <textPath
                  href={`#${arcId}`}
                  startOffset="50%"
                  textAnchor="middle"
                >
                  {title}
                </textPath>
              </text>
              <g className={styles.arrowGroup}>
                {COVER_ARROW_PATHS.map((d, index) => (
                  <path
                    key={d}
                    ref={(node) => {
                      arrowPathRefs.current[index] = node;
                    }}
                    className={styles.arrowPath}
                    d={d}
                  />
                ))}
              </g>
            </svg>
          </span>
        </button>
      ) : null}
    </div>
  );
}
