"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { withDefaults } from "@/utils/props/withDefaults";
import { RotationTableContent } from "./RotationTableContent";
import {
  useRotationTablePointer,
  type RotationValueMode,
} from "./useRotationTablePointer";
import { rotationTableClassName, withControlPointerHandlers } from "./utils/rotationTableUtils";

export type RotationTableProps = {
  degrees: number;
  onDegreesChange: (degrees: number) => void;
  onDegreesCommit?: (degrees: number) => void;
  transformOrigin?: string;
  /** When true (default), apply CSS rotate to the content wrap. Dial sets false. */
  applyTransform?: boolean;
  deadZoneRadiusPercent?: number;
  /**
   * absolute — emit atan2 degrees (celestial dial).
   * relative — emit startDegrees + unwrapped pointer delta (label scrub).
   */
  valueMode?: RotationValueMode;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Shrink-wrap children and center (dial face). */
  fill?: boolean;
  children: ReactNode;
  /** When set, only this node starts/continues rotation drag. */
  control?: ReactNode;
  /** Stop parent pointer handlers (e.g. label DnD) when using `control`. Default: true when `control` is set. */
  stopPropagationOnControl?: boolean;
  /** Extra class on the rotated content wrap (e.g. row-reverse for end connection). */
  contentClassName?: string;
};

const ROTATION_TABLE_DEFAULTS = {
  transformOrigin: "center center",
  applyTransform: true,
  deadZoneRadiusPercent: 0,
  valueMode: "absolute",
  disabled: false,
  fill: false,
} as const;

export function RotationTable(props: RotationTableProps) {
  const { degrees, transformOrigin, applyTransform, deadZoneRadiusPercent, valueMode, disabled, fill } =
    withDefaults(props, ROTATION_TABLE_DEFAULTS);
  const { control } = props;
  const originRef = useRef<HTMLDivElement | null>(null);
  const { pointerHandlers } = useRotationTablePointer({
    originRef,
    degrees,
    onDegreesChange: props.onDegreesChange,
    onDegreesCommit: props.onDegreesCommit,
    deadZoneRadiusPercent,
    disabled,
    valueMode,
    stopPropagation: Boolean(control) && (props.stopPropagationOnControl ?? true),
  });

  return (
    <div
      ref={applyTransform ? undefined : originRef}
      className={rotationTableClassName(fill, props.className)}
      style={props.style}
      {...(control ? undefined : pointerHandlers)}
    >
      <RotationTableContent
        applyTransform={applyTransform}
        originRef={originRef}
        degrees={degrees}
        transformOrigin={transformOrigin}
        contentClassName={props.contentClassName}
        control={withControlPointerHandlers(control, pointerHandlers)}
      >
        {props.children}
      </RotationTableContent>
    </div>
  );
}
