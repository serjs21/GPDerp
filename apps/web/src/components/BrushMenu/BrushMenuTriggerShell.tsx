import type { BrushMenuTriggerShellProps } from "./BrushMenu.types";
import styles from "./BrushMenu.module.css";

/** Brush triggers sit in an in-flow sizing shell (width grows with the paint); plain triggers render bare. */
export function BrushMenuTriggerShell({ triggerBrush, shellRef, children }: BrushMenuTriggerShellProps) {
  if (!triggerBrush) return children;
  return (
    <div ref={shellRef} className={styles.shell}>
      <div className={styles.avatarSlot} aria-hidden />
      {children}
    </div>
  );
}
