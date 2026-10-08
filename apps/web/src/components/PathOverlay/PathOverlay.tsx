"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { animate } from "animejs";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useOptionalCelestialTheme } from "@/app/providers/CelestialThemeProvider";
import { OverlayNextLabel } from "./OverlayNextLabel/OverlayNextLabel";
import { OverlayPrevLabel } from "./OverlayPrevLabel/OverlayPrevLabel";
import styles from "./PathOverlay.module.css";
import {
  darkMaskForSeam,
  darkPathUnitForSeam,
  isDarkSide,
  lightMaskForSeam,
  lightPathUnitForSeam,
  type PathSeam,
} from "./pathGeometry";

/** Stagger-grid cell size in CSS pixels (true squares). */
const CELL_PX = 10;

const CELL_DURATION_MS = 300;
const TOTAL_OPEN_MS = 800;
const LABEL_DELAY_MS = 800;
const LABEL_DURATION_MS = 400;
const OVERLAY_OPACITY = 0.9;

const DARK_FILL_FALLBACK = "rgba(0, 0, 0, 0.55)";
const LIGHT_FILL_FALLBACK = "rgba(255, 255, 255, 0.55)";

/** Hover glow (motion) — same filter/textShadow approach as Auth TextToIcon. */
const GLOW_EASE = [0.38, 0, 0.9, 1] as const;
const LOBE_GLOW_REST = {
  backgroundColor: "rgba(0, 0, 0, 0)",
  boxShadow: "inset 0 0 0 0 transparent",
} as const;
const DARK_LOBE_GLOW_SOFT =
  "inset 0 0 4rem 1.5rem rgba(245, 235, 224, 0.22), inset 0 0 1.5rem 0.4rem rgba(255, 255, 255, 0.1)";
const DARK_LOBE_GLOW_STRONG =
  "inset 0 0 5.5rem 2.25rem rgba(245, 235, 224, 0.38), inset 0 0 2rem 0.6rem rgba(255, 255, 255, 0.18)";
const LIGHT_LOBE_GLOW_SOFT =
  "inset 0 0 4rem 1.5rem rgba(255, 230, 160, 0.28), inset 0 0 1.5rem 0.4rem rgba(255, 255, 255, 0.14)";
const LIGHT_LOBE_GLOW_STRONG =
  "inset 0 0 5.5rem 2.25rem rgba(255, 230, 160, 0.45), inset 0 0 2rem 0.6rem rgba(255, 255, 255, 0.22)";
const LABEL_GLOW_SOFT =
  "0 0 0.55em color-mix(in srgb, #ffffff 48%, transparent), 0 0 1.1em color-mix(in srgb, #ffffff 28%, transparent)";
const LABEL_GLOW_STRONG =
  "0 0 0.7em color-mix(in srgb, #ffffff 68%, transparent), 0 0 1.4em color-mix(in srgb, #ffffff 40%, transparent)";
const LABEL_FILTER_SOFT =
  "brightness(1.05) drop-shadow(0 0 0.35em color-mix(in srgb, #ffffff 28%, transparent))";
const LABEL_FILTER_STRONG =
  "brightness(1.1) drop-shadow(0 0 0.5em color-mix(in srgb, #ffffff 42%, transparent))";
/** Right label sits on the light half (dark ink) — warm parchment halo. */
const LABEL_RIGHT_GLOW_SOFT =
  "0 0 0.45em color-mix(in srgb, #ffe9a8 55%, transparent), 0 0 1em color-mix(in srgb, #fff4d0 35%, transparent)";
const LABEL_RIGHT_GLOW_STRONG =
  "0 0 0.65em color-mix(in srgb, #ffe9a8 72%, transparent), 0 0 1.3em color-mix(in srgb, #fff4d0 48%, transparent)";
const LABEL_RIGHT_FILTER_SOFT =
  "brightness(1.04) drop-shadow(0 0 0.3em color-mix(in srgb, #ffe9a8 40%, transparent))";
const LABEL_RIGHT_FILTER_STRONG =
  "brightness(1.08) drop-shadow(0 0 0.45em color-mix(in srgb, #ffe9a8 55%, transparent))";
const LABEL_GLOW_REST = {
  textShadow: "none",
  filter: "brightness(1)",
} as const;

export type PathOverlayFillOrigin =
  | "center"
  | "corners"
  | "sideCorners"
  | "vertical";
export type PathOverlaySeam = PathSeam;

export type PathOverlayProps = {
  open: boolean;
  onClose?: () => void;
  /** Left (dark) half. */
  onKeepScrolling?: () => void;
  /** Right (light) half. */
  onGoToBeginning?: () => void;
  /**
   * Where the stagger fill begins.
   * - `center` — bloom from viewport center
   * - `corners` — dark from top-left, light from bottom-right
   * - `sideCorners` — dark from both left corners, light from both right corners
   * - `vertical` — dark/bright from top vs bottom (sun-aware); skyMid / highlight paints
   */
  fillOrigin?: PathOverlayFillOrigin;
  /**
   * Split geometry.
   * - `sCurve` — expressed S-seam
   * - `straight` — vertical midline
   */
  seam?: PathOverlaySeam;
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

function cellRing(
  fillOrigin: PathOverlayFillOrigin,
  col: number,
  row: number,
  cols: number,
  rows: number,
  dark: boolean,
  darkFromTop: boolean,
): number {
  if (fillOrigin === "vertical") {
    // Dark from top (sun up) or bottom (sun down); bright from the opposite edge.
    if (dark) {
      return darkFromTop ? row : rows - 1 - row;
    }
    return darkFromTop ? rows - 1 - row : row;
  }

  if (fillOrigin === "sideCorners") {
    // Dark from both left corners; light from both right corners.
    if (dark) {
      const fromTopLeft = Math.max(col, row);
      const fromBottomLeft = Math.max(col, rows - 1 - row);
      return Math.min(fromTopLeft, fromBottomLeft);
    }
    const fromTopRight = Math.max(cols - 1 - col, row);
    const fromBottomRight = Math.max(cols - 1 - col, rows - 1 - row);
    return Math.min(fromTopRight, fromBottomRight);
  }

  if (fillOrigin === "corners") {
    // Dark from top-left; light from bottom-right.
    return dark
      ? Math.max(col, row)
      : Math.max(cols - 1 - col, rows - 1 - row);
  }

  const centerCol = (cols - 1) / 2;
  const centerRow = (rows - 1) / 2;
  return Math.max(Math.abs(col - centerCol), Math.abs(row - centerRow));
}

function cellDelayMs(
  fillOrigin: PathOverlayFillOrigin,
  col: number,
  row: number,
  cols: number,
  rows: number,
  staggerStepMs: number,
  dark: boolean,
  darkFromTop: boolean,
): number {
  return (
    cellRing(fillOrigin, col, row, cols, rows, dark, darkFromTop) * staggerStepMs
  );
}

function maxRingForOrigin(
  fillOrigin: PathOverlayFillOrigin,
  cols: number,
  rows: number,
): number {
  if (fillOrigin === "vertical") {
    return rows - 1;
  }
  if (fillOrigin === "sideCorners") {
    // Farthest cell is mid-height near the opposite side of each half.
    return Math.max(cols - 1, Math.ceil((rows - 1) / 2));
  }
  if (fillOrigin === "corners") {
    return Math.max(cols - 1, rows - 1);
  }
  return Math.max((cols - 1) / 2, (rows - 1) / 2);
}

type PathScrimProps = {
  open: boolean;
  reduceMotion: boolean | null;
  fillOrigin: PathOverlayFillOrigin;
  seam: PathOverlaySeam;
  darkClipId: string;
  lightClipId: string;
  onKeepScrolling?: () => void;
  onGoToBeginning?: () => void;
  onCloseComplete?: () => void;
};

function PathScrim({
  open,
  reduceMotion,
  fillOrigin,
  seam,
  darkClipId,
  lightClipId,
  onKeepScrolling,
  onGoToBeginning,
  onCloseComplete,
}: PathScrimProps) {
  const t = useTranslations("PathOverlay.pathOverlay");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const celestial = useOptionalCelestialTheme();
  const [hoveredSide, setHoveredSide] = useState<"dark" | "light" | null>(null);

  const darkMask = darkMaskForSeam(seam);
  const lightMask = lightMaskForSeam(seam);
  const darkPathUnit = darkPathUnitForSeam(seam);
  const lightPathUnit = lightPathUnitForSeam(seam);

  const sunAboveHorizon = celestial?.scene.layout.sun.isAboveHorizon ?? true;
  const darkFromTop = fillOrigin === "vertical" ? sunAboveHorizon : true;

  const useThemePaints = fillOrigin === "vertical" && celestial != null;
  const darkFill = useThemePaints
    ? celestial.scene.theme.skyMid
    : DARK_FILL_FALLBACK;
  const lightFill = useThemePaints
    ? celestial.scene.theme.highlightOnPaper
    : LIGHT_FILL_FALLBACK;

  useEffect(() => {
    const canvas = canvasRef.current;
    const labels = labelsRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    type Cell = { x: number; y: number; delay: number; dark: boolean };
    let gridW = 0;
    let gridH = 0;
    let cells: Cell[] = [];
    let maxCellDelay = 0;
    let animationDone = reduceMotion === true;

    const buildGrid = () => {
      const { cols, rows } = gridDimsForViewport(
        window.innerWidth,
        window.innerHeight,
      );
      gridW = cols * CELL_PX;
      gridH = rows * CELL_PX;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(gridW * dpr);
      canvas.height = Math.round(gridH * dpr);
      canvas.style.width = `${gridW}px`;
      canvas.style.height = `${gridH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const maxRing = maxRingForOrigin(fillOrigin, cols, rows);
      const staggerStepMs =
        maxRing > 0 ? (TOTAL_OPEN_MS - CELL_DURATION_MS) / maxRing : 0;

      cells = [];
      maxCellDelay = 0;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const dark = isDarkSide((col + 0.5) / cols, (row + 0.5) / rows, seam);
          const delay = cellDelayMs(
            fillOrigin,
            col,
            row,
            cols,
            rows,
            staggerStepMs,
            dark,
            darkFromTop,
          );
          maxCellDelay = Math.max(maxCellDelay, delay);
          cells.push({
            x: col * CELL_PX,
            y: row * CELL_PX,
            delay,
            dark,
          });
        }
      }

      return;
    };

    const paintCell = (cell: Cell, progress: number) => {
      if (progress <= 0) return;
      const t = progress >= 1 ? 1 : easeOut3(progress);
      const size = CELL_PX * t;
      const inset = (CELL_PX - size) / 2;
      ctx.globalAlpha = t * OVERLAY_OPACITY;
      ctx.fillStyle = cell.dark ? darkFill : lightFill;
      ctx.fillRect(cell.x + inset, cell.y + inset, size, size);
    };

    const paintOpen = (timeMs: number) => {
      ctx.clearRect(0, 0, gridW, gridH);
      for (const cell of cells) {
        const local = (timeMs - cell.delay) / CELL_DURATION_MS;
        if (local <= 0) continue;
        paintCell(cell, local >= 1 ? 1 : local);
      }
      ctx.globalAlpha = 1;
    };

    const paintClose = (closeTimeMs: number) => {
      ctx.clearRect(0, 0, gridW, gridH);
      for (const cell of cells) {
        const closeDelay = maxCellDelay - cell.delay;
        const local = (closeTimeMs - closeDelay) / CELL_DURATION_MS;
        if (local <= 0) {
          paintCell(cell, 1);
          continue;
        }
        if (local >= 1) continue;
        paintCell(cell, 1 - easeOut3(local));
      }
      ctx.globalAlpha = 1;
    };

    const paintFinal = () => {
      paintOpen(TOTAL_OPEN_MS);
    };

    const syncAfterAnimation = () => {
      buildGrid();
      paintFinal();
    };

    buildGrid();

    const onResize = () => {
      if (!animationDone) return;
      syncAfterAnimation();
    };
    window.addEventListener("resize", onResize);

    let cellAnim: { cancel: () => void } | null = null;
    let labelAnim: { cancel: () => void } | null = null;
    let cancelled = false;

    const runGridClose = () => {
      paintFinal();
      const clock = { t: 0 };
      cellAnim = animate(clock, {
        t: TOTAL_OPEN_MS,
        duration: TOTAL_OPEN_MS,
        ease: "linear",
        onUpdate: () => {
          if (!cancelled) paintClose(clock.t);
        },
        onComplete: () => {
          if (cancelled) return;
          animationDone = false;
          paintClose(TOTAL_OPEN_MS);
          onCloseComplete?.();
        },
      });
    };

    if (reduceMotion) {
      if (open) {
        paintFinal();
        if (labels) labels.style.opacity = "1";
      } else {
        paintClose(TOTAL_OPEN_MS);
        if (labels) labels.style.opacity = "0";
        onCloseComplete?.();
      }
      return () => {
        window.removeEventListener("resize", onResize);
      };
    }

    if (open) {
      animationDone = false;
      if (labels) labels.style.opacity = "0";
      paintOpen(0);

      const clock = { t: 0 };
      cellAnim = animate(clock, {
        t: TOTAL_OPEN_MS,
        duration: TOTAL_OPEN_MS,
        ease: "linear",
        onUpdate: () => {
          if (!cancelled) paintOpen(clock.t);
        },
        onComplete: () => {
          if (cancelled) return;
          animationDone = true;
          syncAfterAnimation();
        },
      });

      labelAnim = labels
        ? animate(labels, {
            opacity: [0, 1],
            delay: LABEL_DELAY_MS,
            duration: LABEL_DURATION_MS,
            ease: "out(2)",
          })
        : null;
    } else {
      animationDone = false;
      if (labels) labels.style.opacity = "0";
      paintFinal();
      runGridClose();
    }

    return () => {
      cancelled = true;
      cellAnim?.cancel();
      labelAnim?.cancel();
      window.removeEventListener("resize", onResize);
    };
  }, [
    open,
    reduceMotion,
    fillOrigin,
    seam,
    darkFromTop,
    darkFill,
    lightFill,
    onCloseComplete,
  ]);

  const darkLobeStyle = {
    WebkitMaskImage: darkMask,
    maskImage: darkMask,
    clipPath: `url(#${darkClipId})`,
    WebkitClipPath: `url(#${darkClipId})`,
  } as CSSProperties;

  const lightLobeStyle = {
    WebkitMaskImage: lightMask,
    maskImage: lightMask,
    clipPath: `url(#${lightClipId})`,
    WebkitClipPath: `url(#${lightClipId})`,
  } as CSSProperties;

  const glowPulse = !reduceMotion && hoveredSide != null;
  const lobeGlowTransition = glowPulse
    ? { duration: 1.15, repeat: Infinity, ease: "easeInOut" as const }
    : { duration: 0.28, ease: GLOW_EASE };
  const labelGlowTransition = glowPulse
    ? {
        duration: 1.15,
        repeat: Infinity,
        ease: "easeInOut" as const,
        textShadow: { duration: 1.15, repeat: Infinity, ease: "easeInOut" as const },
        filter: { duration: 1.15, repeat: Infinity, ease: "easeInOut" as const },
      }
    : { duration: 0.28, ease: GLOW_EASE };

  return (
    <div className={styles.scrim}>
      <svg className={styles.clipDefs} width={0} height={0} aria-hidden>
        <defs>
          <clipPath id={darkClipId} clipPathUnits="objectBoundingBox">
            <path d={darkPathUnit} />
          </clipPath>
          <clipPath id={lightClipId} clipPathUnits="objectBoundingBox">
            <path d={lightPathUnit} />
          </clipPath>
        </defs>
      </svg>

      <canvas ref={canvasRef} className={styles.grid} aria-hidden />

      {open ? (
        <>
          <motion.button
            type="button"
            className={styles.lobe}
            style={darkLobeStyle}
            aria-label={t("continueJourney")}
            onClick={() => onKeepScrolling?.()}
            onHoverStart={() => setHoveredSide("dark")}
            onHoverEnd={() => setHoveredSide((side) => (side === "dark" ? null : side))}
            initial={false}
            animate={
              !reduceMotion && hoveredSide === "dark"
                ? {
                    backgroundColor: [
                      "rgba(245, 240, 232, 0.06)",
                      "rgba(245, 240, 232, 0.16)",
                      "rgba(245, 240, 232, 0.06)",
                    ],
                    boxShadow: [DARK_LOBE_GLOW_SOFT, DARK_LOBE_GLOW_STRONG, DARK_LOBE_GLOW_SOFT],
                  }
                : LOBE_GLOW_REST
            }
            transition={
              hoveredSide === "dark" ? lobeGlowTransition : { duration: 0.28, ease: GLOW_EASE }
            }
          />

          <motion.button
            type="button"
            className={styles.lobe}
            style={lightLobeStyle}
            aria-label={t("goBackToStart")}
            onClick={() => onGoToBeginning?.()}
            onHoverStart={() => setHoveredSide("light")}
            onHoverEnd={() => setHoveredSide((side) => (side === "light" ? null : side))}
            initial={false}
            animate={
              !reduceMotion && hoveredSide === "light"
                ? {
                    backgroundColor: [
                      "rgba(255, 248, 220, 0.08)",
                      "rgba(255, 248, 220, 0.2)",
                      "rgba(255, 248, 220, 0.08)",
                    ],
                    boxShadow: [LIGHT_LOBE_GLOW_SOFT, LIGHT_LOBE_GLOW_STRONG, LIGHT_LOBE_GLOW_SOFT],
                  }
                : LOBE_GLOW_REST
            }
            transition={
              hoveredSide === "light" ? lobeGlowTransition : { duration: 0.28, ease: GLOW_EASE }
            }
          />
        </>
      ) : null}

      <div
        ref={labelsRef}
        className={styles.labels}
        aria-hidden
        style={open ? undefined : ({ opacity: 0, pointerEvents: "none" } as CSSProperties)}
      >
        <motion.div
          className={styles.labelLeft}
          initial={false}
          animate={
            !reduceMotion && hoveredSide === "dark"
              ? {
                  textShadow: [LABEL_GLOW_SOFT, LABEL_GLOW_STRONG, LABEL_GLOW_SOFT],
                  filter: [LABEL_FILTER_SOFT, LABEL_FILTER_STRONG, LABEL_FILTER_SOFT],
                }
              : LABEL_GLOW_REST
          }
          transition={
            hoveredSide === "dark" ? labelGlowTransition : { duration: 0.28, ease: GLOW_EASE }
          }
        >
          <OverlayNextLabel />
        </motion.div>
        <motion.div
          className={styles.labelRight}
          initial={false}
          animate={
            !reduceMotion && hoveredSide === "light"
              ? {
                  textShadow: [
                    LABEL_RIGHT_GLOW_SOFT,
                    LABEL_RIGHT_GLOW_STRONG,
                    LABEL_RIGHT_GLOW_SOFT,
                  ],
                  filter: [
                    LABEL_RIGHT_FILTER_SOFT,
                    LABEL_RIGHT_FILTER_STRONG,
                    LABEL_RIGHT_FILTER_SOFT,
                  ],
                }
              : LABEL_GLOW_REST
          }
          transition={
            hoveredSide === "light" ? labelGlowTransition : { duration: 0.28, ease: GLOW_EASE }
          }
        >
          <OverlayPrevLabel />
        </motion.div>
      </div>
    </div>
  );
}

export function PathOverlay({
  open,
  onClose,
  onKeepScrolling,
  onGoToBeginning,
  fillOrigin = "center",
  seam = "sCurve",
  children,
  className,
  contentClassName,
}: PathOverlayProps) {
  const t = useTranslations("PathOverlay.pathOverlay");
  const titleId = useId();
  const clipUid = useId().replace(/:/g, "");
  const darkClipId = `path-dark-${clipUid}`;
  const lightClipId = `path-light-${clipUid}`;
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  const handleCloseComplete = useCallback(() => {
    setMounted(false);
  }, []);

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
      {mounted ? (
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
          exit={{ opacity: 1 }}
        >
          <span id={titleId} className={styles.visuallyHidden}>
            {t("title")}
          </span>

          <PathScrim
            open={open}
            reduceMotion={reduceMotion}
            fillOrigin={fillOrigin}
            seam={seam}
            darkClipId={darkClipId}
            lightClipId={lightClipId}
            onKeepScrolling={onKeepScrolling}
            onGoToBeginning={onGoToBeginning}
            onCloseComplete={handleCloseComplete}
          />

          <motion.div
            className={contentClass}
            style={{ overflow: "visible" } as CSSProperties}
            initial={false}
            animate={{ opacity: open ? 1 : 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.32, ease: [0.38, 0, 0.9, 1] }
            }
          >
            <div className={styles.contentHitTarget}>{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
