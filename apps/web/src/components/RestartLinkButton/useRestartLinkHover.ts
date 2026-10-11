"use client";

import { useCallback, useState, type FocusEvent } from "react";

/** Expanded (hover lockup) while pointer-inside or keyboard-focused, unless disabled; `forceHover` pins it. */
export function useRestartLinkHover(disabled: boolean, forceHover: boolean) {
  const [pointerInside, setPointerInside] = useState(false);
  const [focusVisible, setFocusVisible] = useState(false);

  const syncFocusVisible = useCallback((event: FocusEvent<HTMLButtonElement>) => {
    setFocusVisible(event.currentTarget.matches(":focus-visible"));
  }, []);

  return {
    expanded: !disabled && (forceHover || pointerInside || focusVisible),
    handlers: {
      onMouseEnter: () => setPointerInside(true),
      onMouseLeave: () => setPointerInside(false),
      onFocus: syncFocusVisible,
      onBlur: () => setFocusVisible(false),
    },
  };
}
