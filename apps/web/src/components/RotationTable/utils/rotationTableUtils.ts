import {
  cloneElement,
  isValidElement,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import styles from "../RotationTable.module.css";

type PointerHandler = (event: ReactPointerEvent<HTMLElement>) => void;

type ControlPointerProps = {
  onPointerDown?: PointerHandler;
  onPointerMove?: PointerHandler;
  onPointerUp?: PointerHandler;
  onPointerCancel?: PointerHandler;
};

type RotationPointerHandlers = Required<ControlPointerProps>;

/** Chain rotation pointer handlers after the control element's own handlers. */
export function withControlPointerHandlers(control: ReactNode, handlers: RotationPointerHandlers): ReactNode {
  if (!control || !isValidElement(control)) return control;
  const prior = control.props as ControlPointerProps;
  return cloneElement(control as ReactElement<ControlPointerProps>, {
    onPointerDown: (event) => {
      prior.onPointerDown?.(event);
      handlers.onPointerDown(event);
    },
    onPointerMove: (event) => {
      prior.onPointerMove?.(event);
      handlers.onPointerMove(event);
    },
    onPointerUp: (event) => {
      prior.onPointerUp?.(event);
      handlers.onPointerUp(event);
    },
    onPointerCancel: (event) => {
      prior.onPointerCancel?.(event);
      handlers.onPointerCancel(event);
    },
  });
}

export function rotationTableClassName(fill: boolean, className: string | undefined): string {
  return [styles.table, fill && styles.tableFill, className].filter(Boolean).join(" ");
}

export function rotationContentClassName(applyTransform: boolean, contentClassName: string | undefined): string {
  return [styles.content, applyTransform && styles.contentRotate, contentClassName].filter(Boolean).join(" ");
}

export function rotationContentStyle(
  applyTransform: boolean,
  degrees: number,
  transformOrigin: string,
): CSSProperties | undefined {
  return applyTransform ? { transform: `rotate(${degrees}deg)`, transformOrigin } : undefined;
}
