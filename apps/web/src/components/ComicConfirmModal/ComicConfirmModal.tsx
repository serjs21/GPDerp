"use client";

import { animate } from "animejs";
import * as Dialog from "@radix-ui/react-dialog";
import { useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ComicCtaBubble } from "./ComicCtaBubble";
import { ComicQuestionBubble } from "./ComicQuestionBubble";
import { COMIC_EASE, COMIC_OVERLAY_MS, resolveOptionsLayout, type ComicBubbleStyle } from "./comicBubblePresets";
import styles from "./ComicConfirmModal.module.css";
import { useComicalBubbles } from "./useComicalBubbles";

export type ComicConfirmOption = {
  id: string;
  label: ReactNode;
  onSelect: () => void;
  bubbleStyle?: ComicBubbleStyle;
  disabled?: boolean;
};

export type ComicConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Configurable question copy (string or rich node). */
  question: ReactNode;
  questionBubbleStyle?: ComicBubbleStyle;
  options: ComicConfirmOption[];
  optionsLayout?: "auto" | "row" | "column";
  closeOnOverlayClick?: boolean;
  closeOnSelect?: boolean;
  className?: string;
};

function fadeElement(el: HTMLElement | null, toOpacity: number, durationMs: number): Promise<void> {
  if (!el) return Promise.resolve();
  return new Promise((resolve) => {
    animate(el, {
      opacity: toOpacity,
      duration: durationMs,
      ease: COMIC_EASE,
      onComplete: () => resolve(),
    });
  });
}

function ctaSlotForIndex(index: number, count: number, layout: "row" | "column"): "start" | "end" | "center" {
  if (layout === "column" || count !== 2) return "center";
  return index === 0 ? "start" : "end";
}

export function ComicConfirmModal({
  open,
  onOpenChange,
  question,
  questionBubbleStyle = "shout",
  options,
  optionsLayout = "auto",
  closeOnOverlayClick = false,
  closeOnSelect = true,
  className,
}: ComicConfirmModalProps) {
  const reduceMotion = useReducedMotion();
  const [present, setPresent] = useState(open);
  const exitingRef = useRef(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLDivElement>(null);
  const ctaRefs = useRef(new Map<string, HTMLButtonElement | null>());

  const layout = resolveOptionsLayout(optionsLayout, options.length);

  const columnBottom = useCallback(
    (index: number) => `calc(1.85rem + ${(options.length - 1 - index) * 3.35}rem)`,
    [options.length],
  );

  const targetsKey = useMemo(
    () =>
      [
        questionBubbleStyle,
        layout,
        options.map((opt) => `${opt.id}:${opt.bubbleStyle ?? "speech"}:${opt.disabled ? 1 : 0}`).join("|"),
      ].join(";"),
    [layout, options, questionBubbleStyle],
  );

  const getTargets = useCallback(
    () => [
      { element: questionRef.current, style: questionBubbleStyle, isQuestion: true },
      ...options.map((opt) => ({
        element: ctaRefs.current.get(opt.id) ?? null,
        style: (opt.bubbleStyle ?? "speech") as ComicBubbleStyle,
      })),
    ],
    [options, questionBubbleStyle],
  );

  const { refreshBubbles } = useComicalBubbles({
    active: present && open,
    stageRef,
    targetsKey,
    getTargets,
  });

  const handleCtaPointer = useCallback(() => {
    requestAnimationFrame(() => refreshBubbles());
  }, [refreshBubbles]);

  const handleSelect = useCallback(
    (option: ComicConfirmOption) => {
      if (option.disabled) return;
      option.onSelect();
      if (closeOnSelect) onOpenChange(false);
    },
    [closeOnSelect, onOpenChange],
  );

  useEffect(() => {
    if (open) {
      exitingRef.current = false;
      setPresent(true);
    }
  }, [open]);

  useEffect(() => {
    if (!present) return;

    if (open) {
      const id = requestAnimationFrame(() => {
        if (reduceMotion) {
          if (overlayRef.current) overlayRef.current.style.opacity = "1";
          if (panelRef.current) panelRef.current.style.opacity = "1";
          return;
        }
        void fadeElement(overlayRef.current, 1, COMIC_OVERLAY_MS);
        void fadeElement(panelRef.current, 1, COMIC_OVERLAY_MS);
      });
      return () => cancelAnimationFrame(id);
    }

    if (exitingRef.current) return;
    exitingRef.current = true;

    let cancelled = false;
    const runExit = async () => {
      if (reduceMotion) {
        if (!cancelled) {
          setPresent(false);
          exitingRef.current = false;
        }
        return;
      }
      await Promise.all([
        fadeElement(overlayRef.current, 0, COMIC_OVERLAY_MS),
        fadeElement(panelRef.current, 0, COMIC_OVERLAY_MS),
      ]);
      if (cancelled) return;
      setPresent(false);
      exitingRef.current = false;
    };
    void runExit();

    return () => {
      cancelled = true;
    };
  }, [open, present, reduceMotion]);

  if (!present) {
    return (
      <Dialog.Root open={false} onOpenChange={onOpenChange}>
        {null}
      </Dialog.Root>
    );
  }

  const questionText = typeof question === "string" ? question : undefined;

  return (
    <Dialog.Root open={open || present} onOpenChange={onOpenChange}>
      <Dialog.Portal forceMount>
        <Dialog.Overlay asChild forceMount>
          <div ref={overlayRef} className={styles.overlay} />
        </Dialog.Overlay>

        <Dialog.Content
          asChild
          forceMount
          onPointerDownOutside={(event) => {
            if (!closeOnOverlayClick) event.preventDefault();
          }}
          onInteractOutside={(event) => {
            if (!closeOnOverlayClick) event.preventDefault();
          }}
        >
          <div className={styles.contentRoot}>
            <div ref={panelRef} className={[styles.panel, className].filter(Boolean).join(" ")}>
              <Dialog.Title className={styles.visuallyHidden}>
                {questionText ?? "Confirmation"}
              </Dialog.Title>
              <Dialog.Description className={styles.visuallyHidden}>
                Choose an option below.
              </Dialog.Description>

              <div
                ref={stageRef}
                className={[
                  styles.stage,
                  questionBubbleStyle === "shout" ? styles.stageShout : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <ComicQuestionBubble ref={questionRef} bubbleStyle={questionBubbleStyle}>
                  {question}
                </ComicQuestionBubble>

                {options.map((option, index) => (
                  <ComicCtaBubble
                    key={option.id}
                    ref={(node) => {
                      ctaRefs.current.set(option.id, node);
                    }}
                    label={option.label}
                    bubbleStyle={option.bubbleStyle}
                    disabled={option.disabled}
                    slot={ctaSlotForIndex(index, options.length, layout)}
                    style={
                      layout === "column" || options.length !== 2
                        ? { bottom: columnBottom(index) }
                        : undefined
                    }
                    onPointerChange={handleCtaPointer}
                    onClick={() => handleSelect(option)}
                  />
                ))}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export type { ComicBubbleStyle } from "./comicBubblePresets";
