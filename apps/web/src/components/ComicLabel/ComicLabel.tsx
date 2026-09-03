"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from "react";
import { ComicBubbleStage } from "@/components/ComicConfirmModal/ComicBubbleStage";
import stageStyles from "@/components/ComicConfirmModal/comicBubbleStage.module.css";
import type { ComicBubbleStyle } from "@/components/ComicConfirmModal/comicBubblePresets";
import {
  stagePaddingClassForDirection,
  type ComicSourceDirection,
} from "@/components/ComicConfirmModal/comicSourceDirection";
import { pickComicLabelInk, resolveComicLabelFill } from "./comicLabelColors";
import styles from "./ComicLabel.module.css";

export type ComicLabelMode = "standalone" | "embedded";

export type ComicLabelProps = {
  name: string;
  /** Label color: hex or Ant Tag preset name → bubble fill. */
  color: string;
  /** Where the speech originates (tail points toward the source). */
  sourceDirection?: ComicSourceDirection;
  bubbleStyle?: ComicBubbleStyle;
  mode?: ComicLabelMode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  children?: ReactNode;
};

const ComicLabelInner = forwardRef<HTMLDivElement | HTMLButtonElement, ComicLabelProps>(
  function ComicLabelInner(
    { name, color, className, style, onClick, children },
    ref,
  ) {
    const fill = resolveComicLabelFill(color);
    const ink = pickComicLabelInk(fill);
    const contentStyle = {
      ...style,
      "--comic-label-ink": ink,
      color: ink,
    } as CSSProperties;

    const contentClass = [
      styles.content,
      onClick ? styles.contentInteractive : "",
      onClick ? styles.contentButton : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    if (onClick) {
      return (
        <button
          ref={ref as Ref<HTMLButtonElement>}
          type="button"
          className={contentClass}
          style={contentStyle}
          data-comic-role="label"
          onClick={onClick}
        >
          {children ?? name}
        </button>
      );
    }

    return (
      <div
        ref={ref as Ref<HTMLDivElement>}
        className={contentClass}
        style={contentStyle}
        data-comic-role="label"
      >
        {children ?? name}
      </div>
    );
  },
);

/**
 * Comic speech-bubble label (comicaljs). Use embedded mode inside a shared
 * ComicBubbleStage when rendering multiple labels (single Comical edit root).
 */
export const ComicLabel = forwardRef<HTMLDivElement | HTMLButtonElement, ComicLabelProps>(
  function ComicLabel(
    {
      name,
      color,
      sourceDirection = "none",
      bubbleStyle = "speech",
      mode = "standalone",
      className,
      style,
      onClick,
      children,
    },
    ref,
  ) {
    const innerRef = useRef<HTMLDivElement | HTMLButtonElement | null>(null);
    const stageRef = useRef<HTMLDivElement | null>(null);

    const fill = useMemo(() => resolveComicLabelFill(color), [color]);

    const setRef = (node: HTMLDivElement | HTMLButtonElement | null) => {
      innerRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    const getTargets = useCallback(
      () => [
        {
          element: innerRef.current,
          style: bubbleStyle,
          sourceDirection,
          backgroundColors: [fill],
        },
      ],
      [bubbleStyle, fill, sourceDirection],
    );

    if (mode === "embedded") {
      return (
        <ComicLabelInner
          ref={setRef}
          name={name}
          color={color}
          className={className}
          style={style}
          onClick={onClick}
        >
          {children}
        </ComicLabelInner>
      );
    }

    const stagePaddingClass = stagePaddingClassForDirection(sourceDirection, {
      stageTailBottom: styles.stageTailBottom,
      stageTailTop: styles.stageTailTop,
      stageTailLeft: styles.stageTailLeft,
      stageTailRight: styles.stageTailRight,
      stageCompact: styles.stageCompact,
    });

    return (
      <ComicBubbleStage
        ref={stageRef}
        active
        targetsKey={`label:${bubbleStyle}:${sourceDirection}:${name}:${fill}`}
        getTargets={getTargets}
        className={[stageStyles.stage, styles.stageStandalone, stagePaddingClass, className]
          .filter(Boolean)
          .join(" ")}
        style={style}
      >
        <ComicLabelInner ref={setRef} name={name} color={color} onClick={onClick}>
          {children}
        </ComicLabelInner>
      </ComicBubbleStage>
    );
  },
);
