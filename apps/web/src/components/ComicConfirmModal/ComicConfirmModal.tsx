"use client";

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
import { ComicButton } from "../ComicButton/ComicButton";
import { ComicDialogContent } from "../ComicDialogContent/ComicDialogContent";
import { ComicBubbleStage } from "./ComicBubbleStage";
import { resolveOptionsLayout, type ComicBubbleStyle } from "./comicBubblePresets";
import styles from "./ComicConfirmModal.module.css";
import { useComicConfirmOpenAnimation } from "./useComicConfirmOpenAnimation";

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

function ctaSlotForIndex(index: number, count: number, layout: "row" | "column"): "start" | "end" | "center" {
  if (layout === "column" || count !== 2) return "center";
  return index === 0 ? "start" : "end";
}

export function ComicConfirmModal({
  open,
  onOpenChange,
  question,
  questionBubbleStyle = "pointedArcs",
  options,
  optionsLayout = "auto",
  closeOnOverlayClick = false,
  closeOnSelect = true,
  className,
}: ComicConfirmModalProps) {
  const reduceMotion = useReducedMotion();
  const [present, setPresent] = useState(open);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLDivElement>(null);
  const ctaRefs = useRef(new Map<string, HTMLButtonElement | null>());
  const refreshBubblesRef = useRef<(() => void) | null>(null);

  const layout = resolveOptionsLayout(optionsLayout, options.length);

  const columnBottom = useCallback(
    (index: number) => `calc(1.85rem + ${(options.length - 1 - index) * 3.35}rem)`,
    [options.length],
  );

  const getCtaElements = useCallback(
    () =>
      options
        .map((opt) => ctaRefs.current.get(opt.id))
        .filter((node): node is HTMLButtonElement => node != null),
    [options],
  );

  const handlePresentEnd = useCallback(() => {
    setPresent(false);
  }, []);

  const { ctasMounted } = useComicConfirmOpenAnimation({
    open,
    present,
    reducedMotion: Boolean(reduceMotion),
    overlayRef,
    panelRef,
    getCtaElements,
    onPresentEnd: handlePresentEnd,
    refreshBubblesRef,
  });

  const getTargets = useCallback(
    () => [
      { element: questionRef.current, style: questionBubbleStyle, isQuestion: true },
      ...(ctasMounted
        ? options.map((opt) => ({
            element: ctaRefs.current.get(opt.id) ?? null,
            style: (opt.bubbleStyle ?? "speech") as ComicBubbleStyle,
          }))
        : []),
    ],
    [ctasMounted, options, questionBubbleStyle],
  );

  const targetsKey = useMemo(
    () =>
      [
        questionBubbleStyle,
        layout,
        ctasMounted ? "with-ctas" : "question-only",
        options.map((opt) => `${opt.id}:${opt.bubbleStyle ?? "speech"}:${opt.disabled ? 1 : 0}`).join("|"),
      ].join(";"),
    [ctasMounted, layout, options, questionBubbleStyle],
  );

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
      setPresent(true);
    }
  }, [open]);

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

              <ComicBubbleStage
                ref={stageRef}
                active={present && open}
                targetsKey={targetsKey}
                getTargets={getTargets}
                refreshRef={refreshBubblesRef}
                className={styles.stage}
              >
                <ComicDialogContent
                  ref={questionRef}
                  mode="embedded"
                  bubbleStyle={questionBubbleStyle}
                >
                  {question}
                </ComicDialogContent>

                {ctasMounted &&
                  options.map((option, index) => (
                    <ComicButton
                      key={option.id}
                      ref={(node) => {
                        ctaRefs.current.set(option.id, node);
                      }}
                      mode="embedded"
                      slot={ctaSlotForIndex(index, options.length, layout)}
                      bubbleStyle={option.bubbleStyle}
                      disabled={option.disabled}
                      style={
                        layout === "column" || options.length !== 2
                          ? { bottom: columnBottom(index) }
                          : undefined
                      }
                      onClick={() => handleSelect(option)}
                    >
                      {option.label}
                    </ComicButton>
                  ))}
              </ComicBubbleStage>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export type { ComicBubbleStyle } from "./comicBubblePresets";
