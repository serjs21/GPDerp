import type { CSSProperties } from "react";
import { LABEL_HALO_DROP_PAD_EXTRA_REM, LABEL_HALO_DROP_PAD_REM } from "../consts/labelHaloConsts";

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

/** Center of `el` as clamped percentages of `container`'s box. */
export function percentFromRect(el: HTMLElement, container: HTMLElement): { xPercent: number; yPercent: number } {
  const elRect = el.getBoundingClientRect();
  const box = container.getBoundingClientRect();
  const width = Math.max(1, box.width);
  const height = Math.max(1, box.height);
  const cx = elRect.left + elRect.width / 2 - box.left;
  const cy = elRect.top + elRect.height / 2 - box.top;
  return {
    xPercent: clampPercent((cx / width) * 100),
    yPercent: clampPercent((cy / height) * 100),
  };
}

/** Caller style plus the drop-area padding custom properties (extra room on the sides and top). */
export function haloPadStyle(style: CSSProperties | undefined): CSSProperties {
  const padWithExtra = `${LABEL_HALO_DROP_PAD_REM + LABEL_HALO_DROP_PAD_EXTRA_REM}rem`;
  return {
    ...style,
    "--label-halo-pad": `${LABEL_HALO_DROP_PAD_REM}rem`,
    "--label-halo-pad-x": padWithExtra,
    "--label-halo-pad-top": padWithExtra,
    "--label-halo-pad-bottom": `${LABEL_HALO_DROP_PAD_REM}rem`,
  } as CSSProperties;
}

/** Drag owner after a drag starts/ends: the newest still-active drag, or null when none remain. */
export function nextDraggingId(activeIds: Set<string>, labelId: string, active: boolean): string | null {
  if (active) return labelId;
  return activeIds.size ? [...activeIds][activeIds.size - 1]! : null;
}
