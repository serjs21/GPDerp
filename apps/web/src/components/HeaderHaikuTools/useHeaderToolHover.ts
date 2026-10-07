"use client";

import { useState, type FocusEvent } from "react";

/** Hover / keyboard-focus state that reveals a header tool's name face. */
export function useHeaderToolHover(forcedHover?: boolean) {
  const [hover, setHover] = useState(false);
  const live = forcedHover === undefined;

  const show = () => {
    if (live) setHover(true);
  };
  const hide = () => {
    if (live) setHover(false);
  };

  return {
    active: forcedHover ?? hover,
    hide,
    handlers: {
      onMouseEnter: show,
      onMouseLeave: hide,
      // Pointer click + focus restore after a modal must not re-stick hover.
      onFocus: (event: FocusEvent<HTMLButtonElement>) => {
        if (event.currentTarget.matches(":focus-visible")) show();
      },
      onBlur: hide,
    },
  };
}
