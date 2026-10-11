"use client";

import { LanternDeleteExit } from "@/components/Lantern/LanternDeleteExit";
import { PathLanternWithHalo } from "./PathLanternWithHalo";
import { RotatedPathLanternWithHalo } from "./RotatedPathLanternWithHalo";
import type { SavedPathLanternProps } from "./SVGPathLantern.types";
import { SVGPathLanternBody } from "./SVGPathLanternBody";

/** Saved haiku on the path: delete-exit flight wrapper around the upright or rotated halo lantern. */
export function SavedPathLantern({
  haiku,
  loading,
  transform,
  face,
  isAnimating,
  suppressReveal,
  ariaLabel,
  showActions,
  lanternClass,
  excludeLabelIds,
  onDeleted,
  onDeleteFailed,
  onExitComplete,
  onChanged,
}: SavedPathLanternProps) {
  return (
    <LanternDeleteExit
      haiku={haiku}
      transform={transform}
      onDeleted={onDeleted}
      onDeleteFailed={onDeleteFailed}
      onExitComplete={onExitComplete}
      onChanged={onChanged}
      excludeLabelIds={excludeLabelIds}
    >
      {({ onDelete, flightStyle, flightExiting }) => {
        const exiting = flightExiting || suppressReveal;
        if (face.kind === "rotated") {
          return (
            <RotatedPathLanternWithHalo
              haiku={haiku}
              transform={transform}
              flightStyle={flightStyle}
              suppressReveal={exiting}
              isAnimating={isAnimating}
              ariaLabel={ariaLabel}
              face={face}
              excludeLabelIds={excludeLabelIds}
              interactive={!isAnimating}
              showActions={showActions}
              onDelete={onDelete}
              onChanged={onChanged}
            />
          );
        }

        return (
          <PathLanternWithHalo
            haiku={haiku}
            transform={transform}
            flightStyle={flightStyle}
            lanternClass={lanternClass}
            exiting={exiting}
            ariaLabel={ariaLabel}
            excludeLabelIds={excludeLabelIds}
            interactive={!isAnimating}
            onChanged={onChanged}
          >
            <SVGPathLanternBody
              haiku={haiku}
              loading={loading}
              showActions={showActions}
              onDelete={onDelete}
              onChanged={onChanged}
            />
          </PathLanternWithHalo>
        );
      }}
    </LanternDeleteExit>
  );
}
