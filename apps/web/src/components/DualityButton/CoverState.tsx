"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type AnimationEvent,
  type CSSProperties,
} from "react";
import {
  COVER_ICON_EXIT_MS,
  COVER_LABEL_MORPH_MS,
  DUALITY_BUTTON_FLIP_MS,
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
  /** Mirror the cover glyph horizontally. */
  coverMirrored?: boolean;
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
 * CoverIcon + DualityButton stacked in one coin. Both are absolute, same size,
 * and rotate on Y together; z-index swaps at the halfway angle so the base
 * (pre-rotated rotateY(-180deg) when covered) lands upright when open.
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
  coverMirrored = false,
  className,
  style,
  coverAriaLabel,
  disabled = false,
  "aria-label": ariaLabel,
  onFlippedChange,
  ...dualityProps
}: CoverStateProps) {
  const isControlled = uncoveredProp != null;
  const [uncoveredInternal, setUncoveredInternal] = useState(defaultUncovered);
  const uncovered = isControlled ? uncoveredProp! : uncoveredInternal;
  const [opening, setOpening] = useState(false);
  const [closing, setClosing] = useState(false);
  const [labelMounted, setLabelMounted] = useState(true);
  /** Matches DualityButton baseWrap clockwise turns after uncover. */
  const [baseRotateDeg, setBaseRotateDeg] = useState(0);
  const prevUncoveredRef = useRef(uncovered);

  const snapCovered = useCallback(() => {
    setOpening(false);
    setClosing(false);
    setLabelMounted(true);
    setBaseRotateDeg(0);
  }, []);

  useLayoutEffect(() => {
    const wasUncovered = prevUncoveredRef.current;
    prevUncoveredRef.current = uncovered;

    if (!uncovered && wasUncovered) {
      if (prefersReducedMotion()) {
        snapCovered();
        return;
      }
      setOpening(false);
      setLabelMounted(true);
      setClosing(true);
      return;
    }

    if (uncovered && !wasUncovered && !opening) {
      setClosing(false);
      setOpening(false);
    }
  }, [opening, snapCovered, uncovered]);

  const onOpenComplete = useCallback(() => {
    if (!isControlled) setUncoveredInternal(true);
    onUncoveredChange?.(true);
    setOpening(false);
    setClosing(false);
    setBaseRotateDeg(Boolean(dualityProps.flipped) ? 180 : 0);
  }, [dualityProps.flipped, isControlled, onUncoveredChange]);

  const onCloseComplete = useCallback(() => {
    setClosing(false);
    if (!isControlled) setUncoveredInternal(false);
  }, [isControlled]);

  const onCoverClick = () => {
    if (disabled || uncovered || opening || closing) return;
    if (!isControlled) setUncoveredInternal(true);
    onUncoveredChange?.(true);
    if (prefersReducedMotion()) {
      setOpening(false);
      setClosing(false);
      return;
    }
    setOpening(true);
  };

  const onLayerAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const name = event.animationName.toLowerCase();
    // Complete once from the base layer animation (both share duration).
    if (!name.includes("coverbase")) return;
    if (opening && name.includes("open")) {
      onOpenComplete();
      return;
    }
    if (closing && name.includes("close")) {
      onCloseComplete();
    }
  };

  const handleFlippedChange = (flipped: boolean) => {
    setBaseRotateDeg((deg) => deg + 180);
    onFlippedChange?.(flipped);
  };

  const rootStyle = {
    ...style,
    "--duality-face-size": `${sizeRem}rem`,
    "--cover-coin-flip-ms": `${COVER_ICON_EXIT_MS}ms`,
  } as CSSProperties;

  const coverActive = !uncovered && !closing && !opening;
  const faceOpen = uncovered || opening;
  const labelExpanded =
    opening || (uncovered && !closing);
  const arrowFollowsBase = uncovered && !closing && !opening;
  const labelBaseRotateDeg =
    arrowFollowsBase || closing || (!uncovered && baseRotateDeg !== 0)
      ? baseRotateDeg
      : 0;

  const flippedProp = dualityProps.flipped;
  const wantFlipped = Boolean(flippedProp);
  useEffect(() => {
    if (!arrowFollowsBase || !uncovered) return;
    setBaseRotateDeg((deg) => {
      const isFlipped = Math.round(deg / 180) % 2 === 1;
      if (isFlipped === wantFlipped) return deg;
      return deg + 180;
    });
  }, [arrowFollowsBase, uncovered, wantFlipped]);

  // Freeze face while covering so category always-asc does not spin mid-close.
  const coveringFaceFlipped =
    Math.round(baseRotateDeg / 180) % 2 === 1;
  const freezeCoverFace =
    closing || (!uncovered && baseRotateDeg !== 0);
  const coinFaceFlipped = freezeCoverFace
    ? coveringFaceFlipped
    : wantFlipped;

  const iconLayerClass = [
    styles.layer,
    styles.layerIcon,
    opening ? styles.layerIconOpening : "",
    closing ? styles.layerIconClosing : "",
    !opening && !closing && faceOpen ? styles.layerIconOpen : "",
  ]
    .filter(Boolean)
    .join(" ");

  const baseLayerClass = [
    styles.layer,
    styles.layerBase,
    opening ? styles.layerBaseOpening : "",
    closing ? styles.layerBaseClosing : "",
    !opening && !closing && faceOpen ? styles.layerBaseOpen : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={[styles.shell, className].filter(Boolean).join(" ")}
      style={rootStyle}
    >
      <div className={styles.coin}>
        <div
          className={baseLayerClass}
          onAnimationEnd={onLayerAnimationEnd}
        >
          <DualityButton
            {...dualityProps}
            flipped={flippedProp === undefined ? undefined : coinFaceFlipped}
            className={[
              styles.face,
              coverActive || closing || opening ? styles.faceInert : "",
            ]
              .filter(Boolean)
              .join(" ")}
            disabled={disabled}
            showDirection={false}
            onFlippedChange={handleFlippedChange}
            aria-label={ariaLabel}
          />
        </div>
        <div className={iconLayerClass}>
          <CoverIcon
            iconSrc={iconSrc}
            backgroundColor={coverBackgroundColor}
            mirrored={coverMirrored}
          />
        </div>
      </div>

      {labelMounted ? (
        <CoverLabel
          title={title}
          expanded={labelExpanded}
          sizeRem={sizeRem}
          uncoverMs={labelMorphMs}
          baseRotateDeg={labelBaseRotateDeg}
          baseRotateMs={DUALITY_BUTTON_FLIP_MS}
          followBaseRotate={arrowFollowsBase}
        />
      ) : null}

      {coverActive ? (
        <button
          type="button"
          className={styles.hit}
          aria-label={coverAriaLabel ?? `Reveal ${title}`}
          disabled={disabled || opening || closing}
          onClick={onCoverClick}
        />
      ) : null}
    </div>
  );
}
