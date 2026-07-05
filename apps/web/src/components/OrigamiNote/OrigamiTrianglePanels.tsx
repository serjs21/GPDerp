import { useMemo, type CSSProperties, ReactNode } from "react";
import { PATTERN_ORIGIN, PATTERN_SIZE, type TrianglePanel } from "./creasePattern";
import type { FoldCamera } from "./origamiFoldMath";
import { solveOrigamiAtState } from "./origamiFoldSolver";
import {
  resolveFoldProgress,
  resolveGlobalFoldProgress,
  type OrigamiFoldState,
  type ResolvedFold,
} from "./origamiFoldSequence";
import styles from "./origamiNote.module.css";

export type OrigamiTrianglePanelsProps = {
  panels: TrianglePanel[];
  colors: string[];
  state?: OrigamiFoldState;
  /** 0–1 progress within the current state segment. */
  progress?: number;
  /** 0–1 progress across flat → collapsed → birdPartial (overrides state/progress). */
  foldProgress?: number;
  /** Direct fold list (overrides state/progress/foldProgress). */
  resolvedFolds?: ResolvedFold[];
  cameraOverride?: Partial<FoldCamera>;
  contentPanelId?: number | null;
  content?: ReactNode;
};

function formatAxis(point: [number, number]): string {
  const x = ((point[0] - PATTERN_ORIGIN.x) / PATTERN_SIZE) * 100;
  const y = ((point[1] - PATTERN_ORIGIN.y) / PATTERN_SIZE) * 100;
  return `${x.toFixed(4)},${y.toFixed(4)}`;
}

export function OrigamiTrianglePanels({
  panels,
  colors,
  state = "flat",
  progress = 1,
  foldProgress,
  resolvedFolds,
  cameraOverride,
  contentPanelId = null,
  content,
}: OrigamiTrianglePanelsProps) {
  const solved = useMemo(() => {
    const folds =
      resolvedFolds ??
      (foldProgress !== undefined
        ? resolveGlobalFoldProgress(foldProgress)
        : resolveFoldProgress(state, progress));
    return solveOrigamiAtState(folds, cameraOverride);
  }, [state, progress, foldProgress, resolvedFolds, cameraOverride]);

  const projectionByPanel = useMemo(() => {
    const map = new Map<number, { clipPath: string; brightness: number }>();
    for (const tri of solved.triangles) {
      map.set(tri.panelId, { clipPath: tri.clipPath, brightness: tri.brightness });
    }
    return map;
  }, [solved.triangles]);

  const stageStyle: CSSProperties = {
    transformStyle: "preserve-3d",
  };

  return (
    <div className={styles.stage} style={stageStyle}>
      {panels.map((panel) => {
        const projection = projectionByPanel.get(panel.id);
        const clipPath = projection?.clipPath ?? panel.clipPath;
        const brightness = projection?.brightness ?? 1;

        const panelStyle: CSSProperties = {
          clipPath,
          WebkitClipPath: clipPath,
          backgroundColor: colors[panel.id],
          filter: brightness === 1 ? undefined : `brightness(${brightness.toFixed(3)})`,
        };

        return (
          <div
            key={panel.id}
            className={styles.panel}
            data-panel-id={panel.id}
            data-axis-0={formatAxis(panel.points[0])}
            data-axis-1={formatAxis(panel.points[1])}
            data-axis-2={formatAxis(panel.points[2])}
            style={panelStyle}
          >
            {contentPanelId === panel.id ? (
              <div className={styles.contentSlot}>{content}</div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
