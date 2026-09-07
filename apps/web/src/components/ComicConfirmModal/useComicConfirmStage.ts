"use client";

import { useRef } from "react";
import type { ComicBubbleStyle } from "./comicBubblePresets";
import type { ComicalBubbleTarget } from "./useComicalBubbles";

export function useComicConfirmStage(options: {
  question: string;
  cancelLabel: string;
  confirmLabel: string;
  questionBubbleStyle: ComicBubbleStyle;
  cancelBubbleStyle: ComicBubbleStyle;
  confirmBubbleStyle: ComicBubbleStyle;
  questionFill: string;
  cancelFill: string;
  confirmFill: string;
}) {
  const {
    question,
    cancelLabel,
    confirmLabel,
    questionBubbleStyle,
    cancelBubbleStyle,
    confirmBubbleStyle,
    questionFill,
    cancelFill,
    confirmFill,
  } = options;

  const questionRef = useRef<HTMLDivElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const confirmRef = useRef<HTMLButtonElement | null>(null);

  const getTargets = (): ComicalBubbleTarget[] => [
    {
      element: questionRef.current,
      style: questionBubbleStyle,
      sourceDirection: "none",
      isQuestion: true,
      backgroundColors: [questionFill],
    },
    {
      element: cancelRef.current,
      style: cancelBubbleStyle,
      sourceDirection: "none",
      backgroundColors: [cancelFill],
    },
    {
      element: confirmRef.current,
      style: confirmBubbleStyle,
      sourceDirection: "none",
      backgroundColors: [confirmFill],
    },
  ];

  const targetsKey = [
    "confirm",
    question,
    cancelLabel,
    confirmLabel,
    questionBubbleStyle,
    cancelBubbleStyle,
    confirmBubbleStyle,
    questionFill,
    cancelFill,
    confirmFill,
  ].join(":");

  return { questionRef, cancelRef, confirmRef, getTargets, targetsKey };
}
