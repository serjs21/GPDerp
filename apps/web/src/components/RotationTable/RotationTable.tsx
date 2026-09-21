"use client";

import {
  cloneElement,
  isValidElement,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  useRotationTablePointer,
  type RotationValueMode,
} from "./useRotationTablePointer";
import styles from "./RotationTable.module.css";

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
  /** Stop parent pointer handlers (e.g. label DnD) when using `control`. */
  stopPropagationOnControl?: boolean;
  /** Extra class on the rotated content wrap (e.g. row-reverse for end connection). */
  contentClassName?: string;
};

type ControlPointerProps = {
  onPointerDown?: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove?: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp?: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel?: (event: ReactPointerEvent<HTMLElement>) => void;
};

export function RotationTable({
  degrees,
  onDegreesChange,
  onDegreesCommit,
  transformOrigin = "center center",
  applyTransform = true,
  deadZoneRadiusPercent = 0,
  valueMode = "absolute",
  disabled = false,
  className,
  style,
  fill = false,
  children,
  control,
  stopPropagationOnControl = Boolean(control),
  contentClassName,
}: RotationTableProps) {
  const originRef = useRef<HTMLDivElement | null>(null);
  const { pointerHandlers } = useRotationTablePointer({
    originRef,
    degrees,
    onDegreesChange,
    onDegreesCommit,
    deadZoneRadiusPercent,
    disabled,
    valueMode,
    stopPropagation: stopPropagationOnControl && Boolean(control),
  });

  const contentStyle: CSSProperties | undefined = applyTransform
    ? {
        transform: `rotate(${degrees}deg)`,
        transformOrigin,
      }
    : undefined;

  const rootHandlers = control ? undefined : pointerHandlers;

  let controlNode = control;
  if (control && isValidElement(control)) {
    const prior = control.props as ControlPointerProps;
    controlNode = cloneElement(control as ReactElement<ControlPointerProps>, {
      onPointerDown: (event: ReactPointerEvent<HTMLElement>) => {
        prior.onPointerDown?.(event);
        pointerHandlers.onPointerDown(event);
      },
      onPointerMove: (event: ReactPointerEvent<HTMLElement>) => {
        prior.onPointerMove?.(event);
        pointerHandlers.onPointerMove(event);
      },
      onPointerUp: (event: ReactPointerEvent<HTMLElement>) => {
        prior.onPointerUp?.(event);
        pointerHandlers.onPointerUp(event);
      },
      onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => {
        prior.onPointerCancel?.(event);
        pointerHandlers.onPointerCancel(event);
      },
    });
  }

  return (
    <div
      ref={applyTransform ? undefined : originRef}
      className={[styles.table, fill ? styles.tableFill : "", className]
        .filter(Boolean)
        .join(" ")}
      style={style}
      {...rootHandlers}
    >
      <div
        ref={applyTransform ? originRef : undefined}
        className={[
          styles.content,
          applyTransform ? styles.contentRotate : "",
          contentClassName,
        ]
          .filter(Boolean)
          .join(" ")}
        style={contentStyle}
      >
        {children}
        {controlNode ? (
          <div className={styles.control}>{controlNode}</div>
        ) : null}
      </div>
    </div>
  );
}
