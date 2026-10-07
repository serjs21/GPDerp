import { useEffect, type RefObject } from "react";

/** Calls `onDismiss` on a pointer down outside `rootRef` or on Escape while `open`. */
export function useDismissOnOutside(
  open: boolean,
  rootRef: RefObject<HTMLElement | null>,
  onDismiss: () => void,
) {
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      if (root && event.target instanceof Node && !root.contains(event.target)) onDismiss();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onDismiss();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, rootRef, onDismiss]);
}
