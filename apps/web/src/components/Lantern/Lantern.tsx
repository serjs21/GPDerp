"use client";

import type { HaikuContainerProps } from "@/components/HaikuContainer/HaikuContainer";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import { formatCreatedAt } from "@/utils/date";
import { formatHaikuTitle } from "@/utils/strings";
import { LANTERN_WIDTH_REM } from "./constants";
import { LanternFrame } from "./LanternFrame";
import type { LanternTransform } from "./lanternTransform";
import styles from "./Lantern.module.css";

export type LanternProps = HaikuContainerProps & {
  className?: string;
  /** Discrete flight step from the concept sheet (overrides progress). */
  step?: number;
  /** Continuous flight progress 0–1 (used when step is omitted). */
  progress?: number;
  /** Max discrete steps when mapping progress. */
  maxSteps?: number;
  /** Explicit transform; wins over step/progress when provided. */
  transform?: Partial<LanternTransform>;
  /** Show only the haiku body (handwritten-on-paper presentation). */
  bodyOnly?: boolean;
};

function resolveContent(props: HaikuContainerProps): {
  title: string;
  body: string;
  meta?: string;
  ariaLabel: string;
  generating: boolean;
} {
  if ("generatingDraft" in props && props.generatingDraft) {
    const draft: GeneratingDraft = props.generatingDraft;
    return {
      title: draft.subject,
      body: draft.content,
      meta: draft.createdAtLabel,
      ariaLabel: `Generating haiku: ${draft.subject}`,
      generating: true,
    };
  }

  const { haiku } = props;
  const title = formatHaikuTitle(haiku);
  return {
    title,
    body: haiku.body,
    meta: formatCreatedAt(haiku.createdAt),
    ariaLabel: `Haiku lantern: ${title}`,
    generating: false,
  };
}

export function Lantern(props: LanternProps) {
  const {
    className,
    step,
    progress,
    maxSteps,
    transform,
    bodyOnly = false,
    ...noteProps
  } = props;
  const { title, body, meta, ariaLabel, generating } = resolveContent(noteProps);

  return (
    <LanternFrame
      className={className}
      ariaLabel={ariaLabel}
      widthRem={LANTERN_WIDTH_REM}
      generating={generating}
      step={step}
      progress={progress}
      maxSteps={maxSteps}
      transform={transform}
    >
      {bodyOnly ? null : <p className={styles.title}>{title}</p>}
      <p className={styles.body}>{body}</p>
      {bodyOnly || !meta ? null : <p className={styles.meta}>{meta}</p>}
    </LanternFrame>
  );
}

export type { LanternTransform };
