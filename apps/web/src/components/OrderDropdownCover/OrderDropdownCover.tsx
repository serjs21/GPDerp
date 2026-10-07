"use client";

import {
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type TransitionEvent,
} from "react";
import { ComicBurstLabel } from "@/components/ComicBurstLabel";
import { resolveComicLabelShapePreset } from "@/components/ComicLabelCreationModal/comicLabelShapes";
import {
  GAVEL_BASE_SRC,
  GAVEL_SRC,
  OPEN_SOUND_MAX_COUNT,
  OPEN_SOUND_SRC,
  ORDER_COVER_LABEL_FILL,
  ORDER_COVER_LABEL_SEED,
  ORDER_COVER_LABEL_SHAPE,
  ORDER_COVER_LABEL_STROKE,
  ORDER_COVER_LABEL_STROKE_WIDTH,
  ORDER_DROPDOWN_COVER_WIDTH_REM,
} from "./consts/orderDropdownCoverConsts";
import type { OrderDropdownCoverProps } from "./OrderDropdownCover.types";
import styles from "./OrderDropdownCover.module.css";
import {
  buildOpenSoundStyle,
  pickOpenSoundPlacement,
  type OpenSoundPlacement,
} from "./utils/openSoundPlacementUtils";
import { buildOrderDropdownCoverStyle } from "./utils/orderDropdownCoverUtils";

const isPressKey = (event: KeyboardEvent) => event.key === " " || event.key === "Enter";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type OpenSound = { id: number; placement: OpenSoundPlacement };

/**
 * Gavel resting raised above its base; pressing strikes it down onto the base,
 * releasing (or leaving) swings it back up. Each landed strike pops a sound effect
 * at a random free spot top/left of the gavel, up to OPEN_SOUND_MAX_COUNT at once.
 */
export function OrderDropdownCover({
  widthRem = ORDER_DROPDOWN_COVER_WIDTH_REM,
  disabled = false,
  className,
  "aria-label": ariaLabel = "Change order",
  "aria-expanded": ariaExpanded,
  "aria-controls": ariaControls,
  "aria-haspopup": ariaHasPopup,
  onClick,
}: OrderDropdownCoverProps) {
  const [pressed, setPressed] = useState(false);
  const [sounds, setSounds] = useState<OpenSound[]>([]);
  const soundIdRef = useRef(0);
  const style = useMemo(() => buildOrderDropdownCoverStyle(widthRem), [widthRem]);
  const labelShape = resolveComicLabelShapePreset(ORDER_COVER_LABEL_SHAPE);

  const showSound = () => {
    // Drop the oldest effects until the new one is under the limit and has a free spot.
    let kept = sounds.slice(Math.max(0, sounds.length - OPEN_SOUND_MAX_COUNT + 1));
    let placement = pickOpenSoundPlacement(kept.map((sound) => sound.placement));
    while (!placement && kept.length > 0) {
      kept = kept.slice(1);
      placement = pickOpenSoundPlacement(kept.map((sound) => sound.placement));
    }
    if (!placement) return;
    soundIdRef.current += 1;
    setSounds([...kept, { id: soundIdRef.current, placement }]);
  };

  const removeSound = (id: number) => {
    setSounds((current) => current.filter((sound) => sound.id !== id));
  };

  const press = () => {
    setPressed(true);
    // No transition runs under reduced motion, so the gavel has landed already.
    if (prefersReducedMotion()) showSound();
  };

  const release = () => setPressed(false);

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (disabled || event.button !== 0) return;
    press();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || !isPressKey(event) || event.repeat) return;
    press();
  };

  const onKeyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (isPressKey(event)) release();
  };

  const onGavelTransitionEnd = (event: TransitionEvent<HTMLImageElement>) => {
    if (event.propertyName === "transform" && pressed) showSound();
  };

  return (
    <button
      type="button"
      className={[styles.root, className].filter(Boolean).join(" ")}
      style={style}
      data-pressed={pressed}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-haspopup={ariaHasPopup}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onBlur={release}
    >
      <span className={styles.label} aria-hidden>
        <ComicBurstLabel
          text=""
          shapeKind={labelShape.kind}
          spikeCount={labelShape.spikeCount}
          randomness={labelShape.randomness}
          fill={ORDER_COVER_LABEL_FILL}
          stroke={ORDER_COVER_LABEL_STROKE}
          strokeWidth={ORDER_COVER_LABEL_STROKE_WIDTH}
          seed={ORDER_COVER_LABEL_SEED}
          stretch
        />
      </span>
      <span className={styles.stage} aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
        <img
          className={styles.gavel}
          src={GAVEL_SRC}
          alt=""
          draggable={false}
          decoding="async"
          onTransitionEnd={onGavelTransitionEnd}
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
        <img className={styles.base} src={GAVEL_BASE_SRC} alt="" draggable={false} decoding="async" />
        {sounds.map((sound) => (
          // eslint-disable-next-line @next/next/no-img-element -- static public SVG
          <img
            key={sound.id}
            className={styles.sound}
            style={buildOpenSoundStyle(sound.placement, widthRem)}
            src={OPEN_SOUND_SRC}
            alt=""
            draggable={false}
            decoding="async"
            onAnimationEnd={() => removeSound(sound.id)}
          />
        ))}
      </span>
    </button>
  );
}
