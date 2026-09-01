"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
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

function ctaRowClass(optionsCount: number, layout: "row" | "column"): string {
  if (layout === "column") return styles.ctaRowColumn;
  if (optionsCount === 1) return styles.ctaRowSingle;
  return "";
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
  const questionPartRef = useRef<HTMLDivElement>(null);
  const questionInnerRef = useRef<HTMLDivElement>(null);
  const dialogLayoutRef = useRef<HTMLDivElement>(null);
  const ctaRowRef = useRef<HTMLDivElement>(null);
  const questionRefreshRef = useRef<(() => void) | null>(null);
  const ctaPartRefs = useRef(new Map<string, HTMLDivElement | null>());
  const ctaButtonRefs = useRef(new Map<string, HTMLButtonElement | null>());
  const ctaRefreshRefs = useRef(new Map<string, { current: (() => void) | null }>());
  const refreshBubblesRef = useRef<(() => void)>(() => {
    questionRefreshRef.current?.();
    for (const entry of ctaRefreshRefs.current.values()) {
      entry.current?.();
    }
  });

  const getCtaRefreshRef = useCallback((id: string) => {
    let entry = ctaRefreshRefs.current.get(id);
    if (!entry) {
      entry = { current: null };
      ctaRefreshRefs.current.set(id, entry);
    }
    return entry;
  }, []);

  const [layoutHeights, setLayoutHeights] = useState<{
    dialog?: number;
    content?: number;
    ctaRow?: number;
  }>({});

  const layout = resolveOptionsLayout(optionsLayout, options.length);

  const getCtaPartElements = useCallback(
    () =>
      options
        .map((opt) => ctaPartRefs.current.get(opt.id))
        .filter((node): node is HTMLDivElement => node != null),
    [options],
  );

  const handlePresentEnd = useCallback(() => {
    setPresent(false);
  }, []);

  const { ctasMounted, isExiting } = useComicConfirmOpenAnimation({
    open,
    present,
    reducedMotion: Boolean(reduceMotion),
    overlayRef,
    panelRef,
    contentRef: questionPartRef,
    ctaRowRef,
    getCtaElements: getCtaPartElements,
    onPresentEnd: handlePresentEnd,
    refreshBubblesRef,
  });

  const showCtaRow = present;
  const ctaPending = present && !ctasMounted && !isExiting;

  useLayoutEffect(() => {
    if (!present) return;

    const id = requestAnimationFrame(() => {
      setLayoutHeights({
        dialog: dialogLayoutRef.current?.offsetHeight,
        content: questionPartRef.current?.offsetHeight,
        ctaRow: ctaRowRef.current?.offsetHeight,
      });
    });

    return () => cancelAnimationFrame(id);
  }, [present, options.length, layout]);

  useEffect(() => {
    if (!present) {
      setLayoutHeights({});
    }
  }, [present]);

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

  // #region agent log
  useEffect(() => {
    if (!present) return;

    const id = requestAnimationFrame(() => {
      const content = questionPartRef.current;
      const stage = content?.firstElementChild as HTMLElement | null;
      const canvas = stage?.querySelector("canvas.comical-generated");
      const svg = stage?.querySelector("svg.comical-generated");
      const inner = questionInnerRef.current;
      const stageRect = stage?.getBoundingClientRect();
      const canvasRect = canvas?.getBoundingClientRect();
      const svgRect = svg?.getBoundingClientRect();

      const innerRect = inner?.getBoundingClientRect();

      fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "53a752" },
        body: JSON.stringify({
          sessionId: "53a752",
          runId: "overflow-fix",
          hypothesisId: "E",
          location: "ComicConfirmModal.tsx:clipMetrics",
          message: "comical svg/canvas overflow",
          data: {
            stageTop: stageRect ? Math.round(stageRect.top) : null,
            canvasTop: canvasRect ? Math.round(canvasRect.top) : null,
            innerTop: innerRect ? Math.round(innerRect.top) : null,
            bleedTopPx:
              stageRect && innerRect ? Math.round(innerRect.top - stageRect.top) : null,
            stagePadTop: stage ? getComputedStyle(stage).paddingTop : null,
            canvasOverflow: canvas ? getComputedStyle(canvas).overflow : null,
            svgOverflow: svg ? getComputedStyle(svg).overflow : null,
            svgFound: Boolean(svg),
            canvasFound: Boolean(canvas),
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    });

    return () => cancelAnimationFrame(id);
  }, [present]);
  // #endregion

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
                ref={dialogLayoutRef}
                className={styles.dialogLayout}
                style={layoutHeights.dialog ? { minHeight: layoutHeights.dialog } : undefined}
              >
                <div
                  ref={questionPartRef}
                  className={styles.contentPart}
                  data-comic-role="dialog-content"
                  style={layoutHeights.content ? { minHeight: layoutHeights.content } : undefined}
                >
                  <ComicBubbleStage
                    active={present}
                    targetsKey={`question:${questionBubbleStyle}:${questionText ?? "node"}`}
                    getTargets={() => [
                      {
                        element: questionInnerRef.current,
                        style: questionBubbleStyle,
                        isQuestion: true,
                      },
                    ]}
                    refreshRef={questionRefreshRef}
                    className={styles.partStage}
                  >
                    <ComicDialogContent
                      ref={questionInnerRef}
                      mode="embedded"
                      bubbleStyle={questionBubbleStyle}
                    >
                      {question}
                    </ComicDialogContent>
                  </ComicBubbleStage>
                </div>

                {showCtaRow && (
                  <div
                    ref={ctaRowRef}
                    className={[styles.ctaRow, ctaRowClass(options.length, layout)]
                      .filter(Boolean)
                      .join(" ")}
                    style={layoutHeights.ctaRow ? { minHeight: layoutHeights.ctaRow } : undefined}
                  >
                    {options.map((option) => (
                      <div
                        key={option.id}
                        ref={(node) => {
                          ctaPartRefs.current.set(option.id, node);
                        }}
                        className={[styles.ctaPart, ctaPending && styles.ctaPartPending]
                          .filter(Boolean)
                          .join(" ")}
                        data-comic-role="cta"
                      >
                        <ComicBubbleStage
                          active={present}
                          targetsKey={`cta:${option.id}:${option.bubbleStyle ?? "speech"}:${option.disabled ? 1 : 0}`}
                          getTargets={() => [
                            {
                              element: ctaButtonRefs.current.get(option.id) ?? null,
                              style: (option.bubbleStyle ?? "speech") as ComicBubbleStyle,
                            },
                          ]}
                          refreshRef={getCtaRefreshRef(option.id)}
                          className={styles.partStage}
                        >
                          <ComicButton
                            ref={(node) => {
                              ctaButtonRefs.current.set(option.id, node);
                            }}
                            mode="embedded"
                            bubbleStyle={option.bubbleStyle}
                            disabled={option.disabled}
                            onClick={() => handleSelect(option)}
                          >
                            {option.label}
                          </ComicButton>
                        </ComicBubbleStage>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export type { ComicBubbleStyle } from "./comicBubblePresets";
