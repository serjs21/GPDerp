"use client";

import {
  forwardRef,
  useEffect,
  useRef,
  type CSSProperties,
  type MutableRefObject,
  type ReactNode,
  type Ref,
} from "react";
import stageStyles from "./comicBubbleStage.module.css";
import { useComicalBubbles, type ComicalBubbleTarget } from "./useComicalBubbles";

export type ComicBubbleStageProps = {
  active: boolean;
  targetsKey: string;
  getTargets: () => ComicalBubbleTarget[];
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  /** Receives refreshBubbles — e.g. after CTAs mount in the modal. */
  refreshRef?: MutableRefObject<(() => void) | null>;
  /** Called when the comical canvas is first available. */
  onBubblesReady?: () => void;
};

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") {
        ref(node);
      } else {
        ref.current = node;
      }
    }
  };
}

/**
 * Single comical parent — all bubble targets must be direct children so
 * offsetLeft/Top align with the canvas.
 */
export const ComicBubbleStage = forwardRef<HTMLDivElement, ComicBubbleStageProps>(
  function ComicBubbleStage(
    { active, targetsKey, getTargets, className, style, children, refreshRef, onBubblesReady },
    forwardedRef,
  ) {
    const stageRef = useRef<HTMLDivElement | null>(null);

    const { refreshBubbles } = useComicalBubbles({
      active,
      stageRef,
      targetsKey,
      getTargets,
      onReady: onBubblesReady,
    });

    useEffect(() => {
      if (refreshRef) {
        refreshRef.current = refreshBubbles;
      }
    }, [refreshBubbles, refreshRef]);

    return (
      <div
        ref={mergeRefs(forwardedRef, stageRef)}
        className={[stageStyles.stage, className].filter(Boolean).join(" ")}
        style={style}
      >
        {children}
      </div>
    );
  },
);
