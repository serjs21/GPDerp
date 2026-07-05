"use client";

import { useMemo, type CSSProperties, type ReactNode } from "react";
import {
  DISPLAY_CREASE_SEGMENTS,
  PATTERN_ORIGIN,
  PATTERN_SIZE,
  PATTERN_TRIANGLES,
  randomFaceColors,
} from "./creasePattern";
import { maxFoldAngle, resolveFoldProgress, stateToFullProgress, type OrigamiFoldState } from "./origamiFoldSequence";
import { OrigamiTrianglePanels } from "./OrigamiTrianglePanels";
import styles from "./origamiNote.module.css";

export type OrigamiNoteProps = {
  /** Target fold pose: flat, collapsed star, or bird-base partial. */
  state?: OrigamiFoldState;
  /** 0–1 progress within the current state segment (default 1 = hold pose). */
  progress?: number;
  /** 0–1 global fold progress across all rotation points (overrides state/progress). */
  foldProgress?: number;
  /** Side length in px. */
  size?: number;
  /** Crease line color. */
  lineColor?: string;
  /** Optional seed for face colors (stable across renders). */
  colorSeed?: number;
  /** Show crease guides (flat state only). */
  showCreaseGuides?: boolean;
  /** Optional content projected on the first triangle panel. */
  children?: ReactNode;
  className?: string;
};

export type { OrigamiFoldState };

const VIEW_BOX = `${PATTERN_ORIGIN.x} ${PATTERN_ORIGIN.y} ${PATTERN_SIZE} ${PATTERN_SIZE}`;

const STATE_LABELS: Record<OrigamiFoldState, string> = {
  flat: "Origami crease pattern with triangulated panels",
  collapsed: "Origami crease pattern in collapsed four-point pose",
  birdPartial: "Origami crease pattern in bird-base partial pose",
};

/** Triangulated crease square with connected 3D hinge solver. */
export function OrigamiNote({
  state = "flat",
  progress = 1,
  foldProgress,
  size = 280,
  lineColor = "#000000",
  colorSeed,
  showCreaseGuides = true,
  children,
  className,
}: OrigamiNoteProps) {
  const resolvedFolds = useMemo(() => {
    if (foldProgress !== undefined) return null;
    return resolveFoldProgress(state, progress);
  }, [state, progress, foldProgress]);

  const isFlat = useMemo(() => {
    if (foldProgress !== undefined) return foldProgress <= 0.001;
    return maxFoldAngle(resolvedFolds ?? []) <= 0.001;
  }, [foldProgress, resolvedFolds]);

  const faceColors = useMemo(
    () => randomFaceColors(PATTERN_TRIANGLES.length, colorSeed),
    [colorSeed],
  );

  const style = {
    "--origami-size": `${size}px`,
    "--origami-line": lineColor,
  } as CSSProperties;

  const rootClass = [styles.square, className].filter(Boolean).join(" ");
  const showGuides = showCreaseGuides && isFlat;

  return (
    <div
      className={rootClass}
      style={style}
      role="img"
      aria-label={STATE_LABELS[state]}
    >
      <OrigamiTrianglePanels
        panels={PATTERN_TRIANGLES}
        colors={faceColors}
        state={state}
        progress={progress}
        foldProgress={foldProgress}
        contentPanelId={0}
        content={children}
      />
      {showGuides ? (
        <svg
          className={styles.guides}
          viewBox={VIEW_BOX}
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <rect
            x={PATTERN_ORIGIN.x}
            y={PATTERN_ORIGIN.y}
            width={PATTERN_SIZE}
            height={PATTERN_SIZE}
            fill="none"
          />
          {DISPLAY_CREASE_SEGMENTS.map(([x1, y1, x2, y2], index) => (
            <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} />
          ))}
        </svg>
      ) : null}
    </div>
  );
}

export { stateToFullProgress };
