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
import type { ComicSourceDirection } from "@/components/ComicConfirmModal/comicSourceDirection";
import { ComicLabelText } from "@/components/ComicLabelText/ComicLabelText";
import { COMIC_LABEL_DEFAULT_BUBBLE_STYLE } from "./comicLabelBubblePresets";
import { resolveComicLabelFill } from "./comicLabelColors";
import {
  contentClassForBubbleStyle,
  stagePaddingClassForLabel,
} from "./comicLabelLayout";
import styles from "./ComicLabel.module.css";
import { formatComicLabelText } from "./utils";

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

type ComicLabelInnerProps = ComicLabelProps & {
  bubbleStyle: ComicBubbleStyle;
};

const ComicLabelInner = forwardRef<HTMLDivElement | HTMLButtonElement, ComicLabelInnerProps>(
  function ComicLabelInner(
    { name, bubbleStyle, className, style, onClick, children },
    ref,
  ) {
    const contentPaddingClass = contentClassForBubbleStyle(bubbleStyle, {
      contentBurst: styles.contentBurst,
      contentSpeech: styles.contentSpeech,
    });

    const contentClass = [
      contentPaddingClass,
      onClick ? styles.contentInteractive : "",
      onClick ? styles.contentButton : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const labelContent =
      children ?? (
        <ComicLabelText
          text={formatComicLabelText(name)}
          size="sm"
          color="#ffffff"
          outlineColor="#000000"
          outlineWidth={2}
        />
      );

    if (onClick) {
      return (
        <button
          ref={ref as Ref<HTMLButtonElement>}
          type="button"
          className={contentClass}
          style={style}
          data-comic-role="label"
          onClick={onClick}
        >
          {labelContent}
        </button>
      );
    }

    return (
      <div
        ref={ref as Ref<HTMLDivElement>}
        className={contentClass}
        style={style}
        data-comic-role="label"
      >
        {labelContent}
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
      bubbleStyle = COMIC_LABEL_DEFAULT_BUBBLE_STYLE,
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
          variant: "label" as const,
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
          bubbleStyle={bubbleStyle}
          className={className}
          style={style}
          onClick={onClick}
        >
          {children}
        </ComicLabelInner>
      );
    }

    const stagePaddingClass = stagePaddingClassForLabel(bubbleStyle, sourceDirection, {
      contentBurst: styles.contentBurst,
      contentSpeech: styles.contentSpeech,
      stageBurst: styles.stageBurst,
      stageSpeech: styles.stageSpeech,
      stageTailBottom: styles.stageTailBottom,
      stageTailTop: styles.stageTailTop,
      stageTailLeft: styles.stageTailLeft,
      stageTailRight: styles.stageTailRight,
      stageCompact: styles.stageSpeech,
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
        <ComicLabelInner
          ref={setRef}
          name={name}
          color={color}
          bubbleStyle={bubbleStyle}
          onClick={onClick}
        >
          {children}
        </ComicLabelInner>
      </ComicBubbleStage>
    );
  },
);
