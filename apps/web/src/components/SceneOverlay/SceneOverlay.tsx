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
import { animate, stagger } from "animejs";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import styles from "./SceneOverlay.module.css";
import {
  isDarkSide,
  yinYangDarkMaskImage,
  yinYangDarkPathUnit,
  yinYangLightMaskImage,
  yinYangLightPathUnit,
} from "./yinYangPaths";

export type SceneOverlayAppearance =
  | "dim"
  | "blur"
  | "vignette"
  | "inkWash"
  | "yinYang";

export type SceneOverlayProps = {
  open: boolean;
  onClose?: () => void;
  /** Left (dark) half when appearance is yinYang. */
  onKeepScrolling?: () => void;
  /** Right (light) half when appearance is yinYang. */
  onGoToBeginning?: () => void;
  appearance?: SceneOverlayAppearance;
  closeOnScrimClick?: boolean;
  children?: ReactNode;
  className?: string;
  /** Optional class for the centered content slot */
  contentClassName?: string;
};

const SCRIM_CLASS: Record<Exclude<SceneOverlayAppearance, "yinYang">, string> = {
  dim: styles.scrimDim,
  blur: styles.scrimBlur,
  vignette: styles.scrimVignette,
  inkWash: styles.scrimInkWash,
};

const DARK_MASK = yinYangDarkMaskImage();
const LIGHT_MASK = yinYangLightMaskImage();
const DARK_PATH_UNIT = yinYangDarkPathUnit();
const LIGHT_PATH_UNIT = yinYangLightPathUnit();

const YIN_YANG_EASE = [0.22, 1, 0.36, 1] as const;

const GRID_COLS = 14;
const GRID_ROWS = 8;
/** Per-cell tween; with center stagger ≈ 2s total open. */
const CELL_DURATION_MS = 500;
const STAGGER_STEP_MS = 180;
const LABEL_DELAY_MS = 1300;
const LABEL_DURATION_MS = 400;

type GridCell = {
  key: string;
  dark: boolean;
};

const GRID_CELLS: GridCell[] = Array.from(
  { length: GRID_COLS * GRID_ROWS },
  (_, index) => {
    const col = index % GRID_COLS;
    const row = Math.floor(index / GRID_COLS);
    const xUnit = (col + 0.5) / GRID_COLS;
    const yUnit = (row + 0.5) / GRID_ROWS;
    return {
      key: `${col}-${row}`,
      dark: isDarkSide(xUnit, yUnit),
    };
  },
);

type YinYangScrimProps = {
  reduceMotion: boolean | null;
  darkClipId: string;
  lightClipId: string;
  onKeepScrolling?: () => void;
  onGoToBeginning?: () => void;
};

function YinYangScrim({
  reduceMotion,
  darkClipId,
  lightClipId,
  onKeepScrolling,
  onGoToBeginning,
}: YinYangScrimProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    const labels = labelsRef.current;
    if (!grid) return;

    const cells = grid.querySelectorAll<HTMLElement>(`.${styles.yinCell}`);

    if (reduceMotion) {
      for (const cell of cells) {
        cell.style.opacity = "1";
        cell.style.transform = "scale(1)";
      }
      if (labels) labels.style.opacity = "1";
      return;
    }

    for (const cell of cells) {
      cell.style.opacity = "0";
      cell.style.transform = "scale(0)";
    }
    if (labels) labels.style.opacity = "0";

    const cellAnim = animate(cells, {
      opacity: [0, 1],
      scale: [0, 1],
      delay: stagger(STAGGER_STEP_MS, {
        grid: [GRID_COLS, GRID_ROWS],
        from: "center",
      }),
      duration: CELL_DURATION_MS,
      ease: "out(3)",
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
    <div className={styles.yinYangScrim}>
      <svg className={styles.yinClipDefs} width={0} height={0} aria-hidden>
        <defs>
          <clipPath id={darkClipId} clipPathUnits="objectBoundingBox">
            <path d={DARK_PATH_UNIT} />
          </clipPath>
          <clipPath id={lightClipId} clipPathUnits="objectBoundingBox">
            <path d={LIGHT_PATH_UNIT} />
          </clipPath>
        </defs>
      </svg>

      <div
        ref={gridRef}
        className={styles.yinGrid}
        aria-hidden
        style={
          {
            "--yin-grid-cols": GRID_COLS,
            "--yin-grid-rows": GRID_ROWS,
          } as CSSProperties
        }
      >
        {GRID_CELLS.map((cell) => (
          <span
            key={cell.key}
            className={`${styles.yinCell} ${
              cell.dark ? styles.yinCellDark : styles.yinCellLight
            }`}
          />
        ))}
      </div>

      <button
        type="button"
        className={`${styles.yinLobe} ${styles.yinLobeDark}`}
        style={darkLobeStyle}
        aria-label="Keep scrolling"
        onClick={() => onKeepScrolling?.()}
      />

      <button
        type="button"
        className={`${styles.yinLobe} ${styles.yinLobeLight}`}
        style={lightLobeStyle}
        aria-label="Go back to the beginning"
        onClick={() => onGoToBeginning?.()}
      />

      <div ref={labelsRef} className={styles.yinLabels} aria-hidden>
        <span className={`${styles.yinLabel} ${styles.yinLabelLeft}`}>
          Keep scrolling
        </span>
        <span className={`${styles.yinLabel} ${styles.yinLabelRight}`}>
          Go back to the beginning
        </span>
      </div>
    </div>
  );
}

export function SceneOverlay({
  open,
  onClose,
  onKeepScrolling,
  onGoToBeginning,
  appearance = "dim",
  closeOnScrimClick = true,
  children,
  className,
  contentClassName,
}: SceneOverlayProps) {
  const titleId = useId();
  const clipUid = useId().replace(/:/g, "");
  const darkClipId = `yin-dark-${clipUid}`;
  const lightClipId = `yin-light-${clipUid}`;
  const reduceMotion = useReducedMotion();
  const isYinYang = appearance === "yinYang";

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (isYinYang) {
        (onKeepScrolling ?? onClose)?.();
        return;
      }
      onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, onKeepScrolling, isYinYang]);

  if (typeof document === "undefined") return null;

  const rootClass = [styles.root, className].filter(Boolean).join(" ");
  const contentClass = [styles.content, contentClassName].filter(Boolean).join(" ");

  const fadeTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: YIN_YANG_EASE };

  const contentTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.34, ease: YIN_YANG_EASE };

  const handleRootKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape") return;
    event.stopPropagation();
    if (isYinYang) {
      (onKeepScrolling ?? onClose)?.();
      return;
    }
    onClose?.();
  };

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="scene-overlay"
          className={rootClass}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          onKeyDown={handleRootKeyDown}
          initial={isYinYang ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={isYinYang && !reduceMotion ? { duration: 0.2 } : fadeTransition}
        >
          <span id={titleId} className={styles.visuallyHidden}>
            Overlay
          </span>

          {isYinYang ? (
            <YinYangScrim
              reduceMotion={reduceMotion}
              darkClipId={darkClipId}
              lightClipId={lightClipId}
              onKeepScrolling={onKeepScrolling}
              onGoToBeginning={onGoToBeginning}
            />
          ) : (
            <motion.button
              type="button"
              className={`${styles.scrim} ${SCRIM_CLASS[appearance]}`}
              aria-label="Close overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={fadeTransition}
              onClick={() => {
                if (closeOnScrimClick) onClose?.();
              }}
            />
          )}

          <motion.div
            className={contentClass}
            style={{ overflow: "visible" } as CSSProperties}
            initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
            transition={contentTransition}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
