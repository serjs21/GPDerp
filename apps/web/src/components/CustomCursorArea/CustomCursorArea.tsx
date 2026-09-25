"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import styles from "./CustomCursorArea.module.css";

export type CustomCursorAreaProps = {
  children: ReactNode;
  /** Element rendered at the pointer while hovering the area. */
  cursor: ReactNode;
  className?: string;
  /** Horizontal offset from the pointer (px). Default 12. */
  offsetX?: number;
  /** Vertical offset from the pointer (px). Default 12. */
  offsetY?: number;
  /** When true, shows the native cursor only. */
  disabled?: boolean;
};

/**
 * Replaces the system cursor with custom content while the pointer is over `children`.
 */
export function CustomCursorArea({
  children,
  cursor,
  className,
  offsetX = 12,
  offsetY = 12,
  disabled = false,
}: CustomCursorAreaProps) {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);
  const offsetRef = useRef({ x: offsetX, y: offsetY });
  offsetRef.current = { x: offsetX, y: offsetY };

  const paintCursor = useCallback((clientX: number, clientY: number) => {
    const node = cursorRef.current;
    if (!node) return;
    const { x, y } = offsetRef.current;
    node.style.transform = `translate3d(${clientX + x}px, ${clientY + y}px, 0)`;
  }, []);

  useEffect(() => {
    if (disabled || !active) return;

    const onWindowMove = (event: MouseEvent) => {
      paintCursor(event.clientX, event.clientY);
    };
    window.addEventListener("mousemove", onWindowMove, { passive: true });
    return () => window.removeEventListener("mousemove", onWindowMove);
  }, [active, disabled, paintCursor]);

  if (disabled) {
    return (
      <div className={[styles.root, className].filter(Boolean).join(" ")}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={[styles.root, styles.rootCustom, className].filter(Boolean).join(" ")}
      onMouseEnter={(event) => {
        setActive(true);
        paintCursor(event.clientX, event.clientY);
      }}
      onMouseMove={(event) => {
        paintCursor(event.clientX, event.clientY);
      }}
      onMouseLeave={() => setActive(false)}
    >
      {children}
      <div
        ref={cursorRef}
        className={[styles.cursor, active ? styles.cursorVisible : ""].filter(Boolean).join(" ")}
        aria-hidden
      >
        {cursor}
      </div>
    </div>
  );
}
