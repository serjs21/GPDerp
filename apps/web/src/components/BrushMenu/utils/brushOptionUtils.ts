import type { CSSProperties } from "react";
import { brushMenuIconForIndex } from "../brushMenuIcons";

export function brushOptionIconSrc(iconSrc: string | undefined, index: number): string {
  return iconSrc ?? brushMenuIconForIndex(index);
}

/** Caller style plus label color and `--brush-option-icon-fill`; undefined when none are set. */
export function brushOptionStyle(
  style: CSSProperties | undefined,
  color: string | undefined,
  backgroundColor: string | undefined,
): CSSProperties | undefined {
  if (!color && !backgroundColor && !style) return undefined;
  return {
    ...style,
    ...(color ? { color } : null),
    ...(backgroundColor ? ({ ["--brush-option-icon-fill"]: backgroundColor } as CSSProperties) : null),
  } as CSSProperties;
}

export function brushOptionClassName(
  styles: Record<string, string>,
  selected: boolean,
  displayOnly: boolean,
  className: string | undefined,
): string {
  return [styles.option, selected ? styles.selected : null, displayOnly ? styles.displayOnly : null, className]
    .filter(Boolean)
    .join(" ");
}

/** Display-only rows leave the tab order and read as disabled. */
export function brushOptionA11y(displayOnly: boolean, disabled: boolean, tabIndex: number | undefined) {
  return {
    tabIndex: displayOnly ? -1 : tabIndex,
    "aria-disabled": displayOnly || disabled || undefined,
  };
}
