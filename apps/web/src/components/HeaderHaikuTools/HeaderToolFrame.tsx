"use client";

import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { resolveComicLabelShapePreset } from "@/components/ComicLabelCreationModal/comicLabelShapes";
import { HEADER_NAV_ICON_SIZE_PX } from "@/consts/header/siteHeaderConsts";
import { HEADER_TOOL_FRAME_FILL, HEADER_TOOL_FRAME_STROKE_WIDTH } from "./consts/headerToolConsts";
import type { HeaderToolFrameProps } from "./HeaderToolFrame.types";
import styles from "./HeaderToolButton.module.css";

/** Sharp cream comic frame with the tool's interactive panel laid over it. */
export function HeaderToolFrame({
  panelClassName,
  role,
  "aria-label": ariaLabel,
  children,
}: HeaderToolFrameProps) {
  const sharpShape = resolveComicLabelShapePreset("sharp");

  return (
    <div className={styles.shell}>
      <ComicBurstLabel
        className={styles.frame}
        text=""
        shapeKind={sharpShape.kind}
        spikeCount={sharpShape.spikeCount}
        randomness={sharpShape.randomness}
        seed={sharpShape.id}
        fontSize={HEADER_NAV_ICON_SIZE_PX}
        paddingX={0}
        paddingY={0}
        strokeWidth={HEADER_TOOL_FRAME_STROKE_WIDTH}
        fill={HEADER_TOOL_FRAME_FILL}
        stretch
      >
        <span aria-hidden />
      </ComicBurstLabel>

      <div
        className={[styles.panel, panelClassName].filter(Boolean).join(" ")}
        role={role}
        aria-label={ariaLabel}
      >
        {children}
      </div>
    </div>
  );
}
