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
 * the direction-arrow slot; after open the arrow rotates with each base flip.
 * Controlled `uncovered → false` flips the cover back on (category switch).
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
  onFlippedChange,
  ...dualityProps
}: CoverStateProps) {
  const isControlled = uncoveredProp != null;
  const [uncoveredInternal, setUncoveredInternal] = useState(defaultUncovered);
  const uncovered = isControlled ? uncoveredProp! : uncoveredInternal;
  const [opening, setOpening] = useState(false);
  const [closing, setClosing] = useState(false);
  const [iconMounted, setIconMounted] = useState(!uncovered);
  const [labelMounted, setLabelMounted] = useState(true);
  /** Matches DualityButton baseWrap clockwise turns after uncover. */
  const [baseRotateDeg, setBaseRotateDeg] = useState(0);
  const prevUncoveredRef = useRef(uncovered);

  const snapCovered = useCallback(() => {
    setOpening(false);
    setClosing(false);
    setIconMounted(true);
    setLabelMounted(true);
    setBaseRotateDeg(0);
  }, []);

  // useLayoutEffect: set closing before paint so baseRotate never drops to 0
  // for a frame (that snapped the arrow to top center on re-cover).
  useLayoutEffect(() => {
    const wasUncovered = prevUncoveredRef.current;
    prevUncoveredRef.current = uncovered;

    if (!uncovered && wasUncovered) {
      if (prefersReducedMotion()) {
        snapCovered();
        return;
      }
      setOpening(false);
      // Keep baseRotateDeg so the arrow exits from its current rim position.
      setLabelMounted(true);
      setIconMounted(true);
      setClosing(true);
      return;
    }

    if (uncovered && !wasUncovered && !opening) {
      // Parent forced open without local open animation.
      setClosing(false);
      setOpening(false);
      setIconMounted(false);
    }
  }, [opening, snapCovered, uncovered]);

  const onOpenComplete = useCallback(() => {
    if (!isControlled) setUncoveredInternal(true);
    onUncoveredChange?.(true);
    setOpening(false);
    setClosing(false);
    setIconMounted(false);
  }, [isControlled, onUncoveredChange]);

  const onCloseComplete = useCallback(() => {
    setClosing(false);
    setIconMounted(true);
    setBaseRotateDeg(0);
    if (!isControlled) setUncoveredInternal(false);
  }, [isControlled]);

  const onCoverClick = () => {
    if (disabled || uncovered || opening || closing) return;
    // Select immediately so the previous category can re-cover in parallel.
    if (!isControlled) setUncoveredInternal(true);
    onUncoveredChange?.(true);
    if (prefersReducedMotion()) {
      setOpening(false);
      setClosing(false);
      setIconMounted(false);
      return;
    }
    setOpening(true);
  };

  const onCoinAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const name = event.animationName.toLowerCase();
    if (opening && name.includes("covercoinflip") && !name.includes("back")) {
      onOpenComplete();
      return;
    }
    if (closing && name.includes("covercoinflipback")) {
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

  const coverActive = !uncovered && iconMounted && !closing;
  const labelExpanded =
    opening || ((uncovered || !iconMounted) && !closing);
  const arrowFollowsBase =
    (uncovered || !iconMounted) && !closing && !opening;
  // Keep rim angle while closing (and on the uncovered→false frame before
  // closing flips true) so the arrow never snaps to top center.
  const labelBaseRotateDeg =
    arrowFollowsBase || closing || (!uncovered && baseRotateDeg !== 0)
      ? baseRotateDeg
      : 0;

  // Keep CoverLabel arrow orbit in sync when opening already-desc (flipped).
  // Skip while covering so flipped→false does not +180 the exit pose to top.
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

  // Coin back is viewed after rotateY(180); pre-flip the base so the open
  // animation ends matching the flat DualityButton that replaces the coin.
  const coinFaceFlipped = opening ? !wantFlipped : wantFlipped;

  const dualityButton = (
    <DualityButton
      {...dualityProps}
      key={opening ? "coin-preflip" : "live"}
      flipped={flippedProp === undefined ? undefined : coinFaceFlipped}
      defaultFlipped={
        flippedProp === undefined
          ? opening
            ? !Boolean(dualityProps.defaultFlipped)
            : dualityProps.defaultFlipped
          : dualityProps.defaultFlipped
      }
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
  );

  const coinClass = [
    styles.coin,
    opening ? styles.coinFlipping : "",
    closing ? styles.coinClosing : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={[styles.shell, className].filter(Boolean).join(" ")}
      style={rootStyle}
    >
      {iconMounted ? (
        <div className={coinClass} onAnimationEnd={onCoinAnimationEnd}>
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
