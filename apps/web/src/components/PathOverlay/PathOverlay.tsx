"use client";

import {
  useEffect,
  useId,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { animate } from "animejs";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import styles from "./PathOverlay.module.css";
import {
  isDarkSide,
  yinYangDarkMaskImage,
  yinYangDarkPathUnit,
  yinYangLightMaskImage,
  yinYangLightPathUnit,
} from "./pathGeometry";

/** Stagger-grid cell size in CSS pixels (true squares). */
const CELL_PX = 10;

const CELL_DURATION_MS = 500;
const TOTAL_OPEN_MS = 2000;
const LABEL_DELAY_MS = 1300;
const LABEL_DURATION_MS = 400;

const DARK_FILL = "rgba(0, 0, 0, 0.55)";
const LIGHT_FILL = "rgba(255, 255, 255, 0.55)";

const DARK_MASK = yinYangDarkMaskImage();
const LIGHT_MASK = yinYangLightMaskImage();
const DARK_PATH_UNIT = yinYangDarkPathUnit();
const LIGHT_PATH_UNIT = yinYangLightPathUnit();

export type PathOverlayProps = {
  open: boolean;
  onClose?: () => void;
  /** Left (dark) half. */
  onKeepScrolling?: () => void;
  /** Right (light) half. */
  onGoToBeginning?: () => void;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
};

function gridDimsForViewport(width: number, height: number) {
  const cols = Math.max(1, Math.ceil(width / CELL_PX));
  const rows = Math.max(1, Math.ceil(height / CELL_PX));
  return {
    cols: cols % 2 === 0 ? cols + 1 : cols,
    rows: rows % 2 === 0 ? rows + 1 : rows,
  };
}

/** Ease-out cubic matching anime `out(3)` feel for canvas cell alpha. */
function easeOut3(t: number) {
  return 1 - (1 - t) ** 3;
}

type PathScrimProps = {
  reduceMotion: boolean | null;
  darkClipId: string;
  lightClipId: string;
  onKeepScrolling?: () => void;
  onGoToBeginning?: () => void;
};

function PathScrim({
  reduceMotion,
  darkClipId,
  lightClipId,
  onKeepScrolling,
  onGoToBeginning,
}: PathScrimProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const labels = labelsRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { cols, rows } = gridDimsForViewport(window.innerWidth, window.innerHeight);
    const gridW = cols * CELL_PX;
    const gridH = rows * CELL_PX;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(gridW * dpr);
    canvas.height = Math.round(gridH * dpr);
    canvas.style.width = `${gridW}px`;
    canvas.style.height = `${gridH}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const centerCol = (cols - 1) / 2;
    const centerRow = (rows - 1) / 2;
    const maxRing = Math.max(centerCol, centerRow);
    const staggerStepMs =
      maxRing > 0 ? (TOTAL_OPEN_MS - CELL_DURATION_MS) / maxRing : 0;

    type Cell = { x: number; y: number; delay: number; dark: boolean };
    const cells: Cell[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const ring = Math.max(
          Math.abs(col - centerCol),
          Math.abs(row - centerRow),
        );
        cells.push({
          x: col * CELL_PX,
          y: row * CELL_PX,
          delay: ring * staggerStepMs,
          dark: isDarkSide((col + 0.5) / cols, (row + 0.5) / rows),
        });
      }
    }

    const paint = (timeMs: number) => {
      ctx.clearRect(0, 0, gridW, gridH);
      for (const cell of cells) {
        const local = (timeMs - cell.delay) / CELL_DURATION_MS;
        if (local <= 0) continue;
        const t = local >= 1 ? 1 : easeOut3(local);
        const size = CELL_PX * t;
        const inset = (CELL_PX - size) / 2;
        ctx.globalAlpha = t;
        ctx.fillStyle = cell.dark ? DARK_FILL : LIGHT_FILL;
        ctx.fillRect(cell.x + inset, cell.y + inset, size, size);
      }
      ctx.globalAlpha = 1;
    };

    if (reduceMotion) {
      paint(TOTAL_OPEN_MS);
      if (labels) labels.style.opacity = "1";
      return;
    }

    if (labels) labels.style.opacity = "0";
    paint(0);

    const clock = { t: 0 };
    const cellAnim = animate(clock, {
      t: TOTAL_OPEN_MS,
      duration: TOTAL_OPEN_MS,
      ease: "linear",
      onUpdate: () => paint(clock.t),
    });

    const labelAnim = labels
      ? animate(labels, {
          opacity: [0, 1],
          delay: LABEL_DELAY_MS,
          duration: LABEL_DURATION_MS,
          ease: "out(2)",
        })
      : null;

    return () => {
      cellAnim.cancel();
      labelAnim?.cancel();
    };
  }, [reduceMotion]);

  const darkLobeStyle = {
    WebkitMaskImage: DARK_MASK,
    maskImage: DARK_MASK,
    clipPath: `url(#${darkClipId})`,
    WebkitClipPath: `url(#${darkClipId})`,
  } as CSSProperties;

  const lightLobeStyle = {
    WebkitMaskImage: LIGHT_MASK,
    maskImage: LIGHT_MASK,
    clipPath: `url(#${lightClipId})`,
    WebkitClipPath: `url(#${lightClipId})`,
  } as CSSProperties;

  return (
    <div className={styles.scrim}>
      <svg className={styles.clipDefs} width={0} height={0} aria-hidden>
        <defs>
          <clipPath id={darkClipId} clipPathUnits="objectBoundingBox">
            <path d={DARK_PATH_UNIT} />
          </clipPath>
          <clipPath id={lightClipId} clipPathUnits="objectBoundingBox">
            <path d={LIGHT_PATH_UNIT} />
          </clipPath>
        </defs>
      </svg>

      <canvas ref={canvasRef} className={styles.grid} aria-hidden />

      <button
        type="button"
        className={styles.lobe}
        style={darkLobeStyle}
        aria-label="Keep scrolling"
        onClick={() => onKeepScrolling?.()}
      />

      <button
        type="button"
        className={styles.lobe}
        style={lightLobeStyle}
        aria-label="Go back to the beginning"
        onClick={() => onGoToBeginning?.()}
      />

      <div ref={labelsRef} className={styles.labels} aria-hidden>
        <span className={`${styles.label} ${styles.labelLeft}`}>Keep scrolling</span>
        <span className={`${styles.label} ${styles.labelRight}`}>
          Go back to the beginning
        </span>
      </div>
    </div>
  );
}

export function PathOverlay({
  open,
  onClose,
  onKeepScrolling,
  onGoToBeginning,
  children,
  className,
  contentClassName,
}: PathOverlayProps) {
  const titleId = useId();
  const clipUid = useId().replace(/:/g, "");
  const darkClipId = `path-dark-${clipUid}`;
  const lightClipId = `path-light-${clipUid}`;
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      (onKeepScrolling ?? onClose)?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, onKeepScrolling]);

  if (typeof document === "undefined") return null;

  const rootClass = [styles.root, className].filter(Boolean).join(" ");
  const contentClass = [styles.content, contentClassName].filter(Boolean).join(" ");

  const handleRootKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape") return;
    event.stopPropagation();
    (onKeepScrolling ?? onClose)?.();
  };

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="path-overlay"
          className={rootClass}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          onKeyDown={handleRootKeyDown}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}
        >
          <span id={titleId} className={styles.visuallyHidden}>
            Overlay
          </span>

          <PathScrim
            reduceMotion={reduceMotion}
            darkClipId={darkClipId}
            lightClipId={lightClipId}
            onKeepScrolling={onKeepScrolling}
            onGoToBeginning={onGoToBeginning}
          />

          <div className={contentClass} style={{ overflow: "visible" } as CSSProperties}>
            {children}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
