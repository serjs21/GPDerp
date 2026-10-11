"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { animate } from "animejs";
import { motion } from "motion/react";
import { useOptionalCelestialTheme } from "@/app/providers/CelestialThemeProvider";
import { OverlayNextLabel } from "./OverlayNextLabel/OverlayNextLabel";
import { OverlayPrevLabel } from "./OverlayPrevLabel/OverlayPrevLabel";
import styles from "./PathOverlay.module.css";
import type { PathOverlayFillOrigin, PathOverlaySeam } from "./PathOverlay";
import {
  darkMaskForSeam,
  darkPathUnitForSeam,
  isDarkSide,
  lightMaskForSeam,
  lightPathUnitForSeam,
} from "./pathGeometry";
import {
  CELL_DURATION_MS,
  CELL_PX,
  DARK_FILL_FALLBACK,
  DARK_LOBE_GLOW_SOFT,
  DARK_LOBE_GLOW_STRONG,
  GLOW_EASE,
  LABEL_DELAY_MS,
  LABEL_DURATION_MS,
  LABEL_FILTER_SOFT,
  LABEL_FILTER_STRONG,
  LABEL_GLOW_REST,
  LABEL_GLOW_SOFT,
  LABEL_GLOW_STRONG,
  LABEL_RIGHT_FILTER_SOFT,
  LABEL_RIGHT_FILTER_STRONG,
  LABEL_RIGHT_GLOW_SOFT,
  LABEL_RIGHT_GLOW_STRONG,
  LIGHT_FILL_FALLBACK,
  LIGHT_LOBE_GLOW_SOFT,
  LIGHT_LOBE_GLOW_STRONG,
  LOBE_GLOW_REST,
  OVERLAY_OPACITY,
  TOTAL_OPEN_MS,
} from "./consts/pathScrimConsts";
import {
  cellDelayMs,
  easeOut3,
  gridDimsForViewport,
  maxRingForOrigin,
} from "./utils/pathScrimGridUtils";

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

/** @animationComponent animejs staggered canvas-grid open/close plus motion hover-glow loops */
export function PathScrim({
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
