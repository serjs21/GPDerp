"use client";

import { useState, type FocusEvent } from "react";
import type { HoverTarget } from "./HaikuActions.types";

/**
 * Hovered/keyboard-focused action (drives the panel tint and the action-name slot). `forcedHover`
 * (Storybook / tests) pins it. Clears when a modal opens; open preference stays until toggled off.
 */
export function useHaikuActionsHover(forcedHover: HoverTarget | undefined, modalBlocking: boolean) {
  const [hover, setHover] = useState<HoverTarget>(null);
  const [prevModalBlocking, setPrevModalBlocking] = useState(modalBlocking);
  const live = forcedHover === undefined;

  if (modalBlocking !== prevModalBlocking) {
    setPrevModalBlocking(modalBlocking);
    if (modalBlocking && live) setHover(null);
  }

  const setHoverIfLive = (next: HoverTarget) => {
    if (live) setHover(next);
  };

  const clearHover = () => setHoverIfLive(null);

  const setHoverFromFocus = (next: HoverTarget, target: HTMLElement) => {
    if (target.matches(":focus-visible")) setHoverIfLive(next);
  };

  const clearHoverFromBlur = (event: FocusEvent<HTMLButtonElement>) => {
    const root = event.currentTarget.closest("[data-haiku-actions-panel]");
    const related = event.relatedTarget;
    if (related instanceof Node && root?.contains(related)) return;
    clearHover();
  };

  return {
    activeHover: live ? hover : forcedHover,
    setHoverIfLive,
    clearHover,
    setHoverFromFocus,
    clearHoverFromBlur,
  };
}
