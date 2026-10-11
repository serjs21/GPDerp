"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDismissOnOutside } from "@/hooks/useDismissOnOutside";

type TextBubblePanelOptions = {
  openProp: boolean | undefined;
  defaultOpen: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled: boolean;
};

/**
 * Open state (controlled or uncontrolled) and panel lifecycle: outside/Escape dismissal, keeping the
 * bubble stage mounted after first open, comical readiness, and the shell size lock.
 */
export function useTextBubblePanel({
  openProp,
  defaultOpen,
  onOpenChange,
  disabled,
}: TextBubblePanelOptions) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const frozenShellSizeRef = useRef<{ width: number; height: number } | null>(null);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? Boolean(openProp) : uncontrolledOpen;
  const [stageMounted, setStageMounted] = useState(open || defaultOpen);
  const [bubbleReady, setBubbleReady] = useState(false);

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );
  const close = useCallback(() => setOpen(false), [setOpen]);

  useDismissOnOutside(open && !disabled, rootRef, close);

  useEffect(() => {
    if (open) setStageMounted(true);
  }, [open]);

  useEffect(() => {
    if (!stageMounted) setBubbleReady(false);
  }, [stageMounted]);

  const handleBubblesReady = useCallback(() => {
    setBubbleReady(true);
  }, []);

  // Lock shell box after first open layout so search/filter can't reshape the bubble.
  useEffect(() => {
    if (!open) return;
    const shell = shellRef.current;
    if (!shell) return;

    const lockSize = () => {
      if (frozenShellSizeRef.current) {
        shell.style.minWidth = `${frozenShellSizeRef.current.width}px`;
        shell.style.minHeight = `${frozenShellSizeRef.current.height}px`;
        return;
      }
      const width = shell.offsetWidth;
      const height = shell.offsetHeight - 100;
      if (width < 1 || height < 1) return;
      frozenShellSizeRef.current = { width, height };
      shell.style.minWidth = `${width}px`;
      shell.style.minHeight = `${height}px`;
    };

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(lockSize);
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const toggle = useCallback(() => {
    if (disabled) return;
    setOpen(!open);
  }, [disabled, open, setOpen]);

  return {
    rootRef,
    shellRef,
    open,
    close,
    toggle,
    stageMounted,
    panelPresent: open || stageMounted,
    bubbleReady,
    handleBubblesReady,
  };
}
