"use client";

import { Lantern } from "@/components/Lantern/Lantern";
import { LanternDeleteExit } from "@/components/Lantern/LanternDeleteExit";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import {
  defaultStopLanternTransformFallback,
  SVG_PATH_LANTERN_WIDTH_REM,
} from "@/components/SVGPath/consts/pathLanternLayoutConsts";
import type { CreationLanternProps } from "./CreationLantern.types";

/** Same width + stop-20 pose as SVGPath list / creation overlay. */
const CREATION_LANTERN_WIDTH_REM = SVG_PATH_LANTERN_WIDTH_REM;
const CREATION_LANTERN_TRANSFORM = defaultStopLanternTransformFallback();

/** Saved haiku lantern (deletable, with exit flight) or the generating draft lantern. */
export function CreationLantern({
  activeHaiku,
  generatingDraft,
  isGenerating,
  showLanternActions,
  ariaLabel,
  onDeleted,
  onExitComplete,
  onHaikuDeleteFailed,
  onHaikuChanged,
}: CreationLanternProps) {
  if (activeHaiku) {
    return (
      <LanternDeleteExit
        haiku={activeHaiku}
        transform={CREATION_LANTERN_TRANSFORM}
        widthRem={CREATION_LANTERN_WIDTH_REM}
        onDeleted={onDeleted}
        onDeleteFailed={onHaikuDeleteFailed}
        onExitComplete={onExitComplete}
        onChanged={onHaikuChanged}
      >
        {({ onDelete, flightStyle, flightExiting }) => (
          <LanternFrame
            ariaLabel={ariaLabel}
            widthRem={CREATION_LANTERN_WIDTH_REM}
            transform={CREATION_LANTERN_TRANSFORM}
            style={flightStyle}
            flightExiting={flightExiting}
            suppressReveal
          >
            <Lantern
              haiku={activeHaiku}
              showActions={showLanternActions && !flightExiting}
              onDelete={onDelete}
              onChanged={onHaikuChanged}
            />
          </LanternFrame>
        )}
      </LanternDeleteExit>
    );
  }

  if (!generatingDraft) return null;

  return (
    <LanternFrame
      ariaLabel={ariaLabel}
      widthRem={CREATION_LANTERN_WIDTH_REM}
      transform={CREATION_LANTERN_TRANSFORM}
      generating={isGenerating}
    >
      <Lantern generatingDraft={generatingDraft} showActions={false} />
    </LanternFrame>
  );
}
