"use client";

import { useMemo, useState, type KeyboardEvent, type PointerEvent } from "react";
import {
  GAVEL_BASE_SRC,
  GAVEL_SRC,
  ORDER_DROPDOWN_COVER_WIDTH_REM,
} from "./consts/orderDropdownCoverConsts";
import type { OrderDropdownCoverProps } from "./OrderDropdownCover.types";
import styles from "./OrderDropdownCover.module.css";
import { buildOrderDropdownCoverStyle } from "./utils/orderDropdownCoverUtils";

const isPressKey = (event: KeyboardEvent) => event.key === " " || event.key === "Enter";

/**
 * Gavel resting raised above its base; pressing strikes it down onto the base,
 * releasing (or leaving) swings it back up.
 */
export function OrderDropdownCover({
  widthRem = ORDER_DROPDOWN_COVER_WIDTH_REM,
  disabled = false,
  className,
  "aria-label": ariaLabel = "Change order",
  onClick,
}: OrderDropdownCoverProps) {
  const [pressed, setPressed] = useState(false);
  const style = useMemo(() => buildOrderDropdownCoverStyle(widthRem), [widthRem]);

  const release = () => setPressed(false);

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (disabled || event.button !== 0) return;
    setPressed(true);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || !isPressKey(event)) return;
    setPressed(true);
  };

  const onKeyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (isPressKey(event)) release();
  };

  return (
    <button
      type="button"
      className={[styles.root, className].filter(Boolean).join(" ")}
      style={style}
      data-pressed={pressed}
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onBlur={release}
    >
      <span className={styles.stage} aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
        <img className={styles.gavel} src={GAVEL_SRC} alt="" draggable={false} decoding="async" />
        {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
        <img className={styles.base} src={GAVEL_BASE_SRC} alt="" draggable={false} decoding="async" />
      </span>
    </button>
  );
}
