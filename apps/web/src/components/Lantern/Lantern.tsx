"use client";

import { type CSSProperties } from "react";
import type { HaikuContainerProps } from "@/components/HaikuContainer/HaikuContainer";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import { formatCreatedAt } from "@/utils/date";
import { formatHaikuTitle } from "@/utils/strings";
import {
  LANTERN_ASSET_SRC,
  LANTERN_IMAGE_HEIGHT,
  LANTERN_IMAGE_WIDTH,
  LANTERN_WIDTH_REM,
} from "./constants";
import {
  getLanternTransformAtProgress,
  getLanternTransformAtStep,
  lanternTransformToCssVars,
  type LanternTransform,
} from "./lanternTransform";
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
} {
  if ("generatingDraft" in props && props.generatingDraft) {
    const draft: GeneratingDraft = props.generatingDraft;
    return {
      title: draft.subject,
      body: draft.content,
      meta: draft.createdAtLabel,
      ariaLabel: `Generating haiku: ${draft.subject}`,
    };
  }

  const { haiku } = props;
  const title = formatHaikuTitle(haiku);
  return {
    title,
    body: haiku.body,
    meta: formatCreatedAt(haiku.createdAt),
    ariaLabel: `Haiku lantern: ${title}`,
  };
}

function resolveTransform(props: Pick<LanternProps, "step" | "progress" | "maxSteps" | "transform">): LanternTransform {
  if (props.transform) {
    const base =
      props.step !== undefined
        ? getLanternTransformAtStep(props.step)
        : props.progress !== undefined
          ? getLanternTransformAtProgress(props.progress, props.maxSteps)
          : getLanternTransformAtStep(0);
    return {
      x: props.transform.x ?? base.x,
      y: props.transform.y ?? base.y,
      scale: props.transform.scale ?? base.scale,
      rotate: props.transform.rotate ?? base.rotate,
    };
  }

  if (props.step !== undefined) {
    return getLanternTransformAtStep(props.step);
  }

  if (props.progress !== undefined) {
    return getLanternTransformAtProgress(props.progress, props.maxSteps);
  }

  return getLanternTransformAtStep(0);
}

export function Lantern(props: LanternProps) {
  const { className, step, progress, maxSteps, transform, bodyOnly = false, ...noteProps } =
    props;
  const { title, body, meta, ariaLabel } = resolveContent(noteProps);
  const resolved = resolveTransform({ step, progress, maxSteps, transform });

  const rootStyle = {
    ...lanternTransformToCssVars(resolved),
    "--lantern-width": `${LANTERN_WIDTH_REM}rem`,
  } as CSSProperties;

  return (
    <article
      className={`${styles.root}${className ? ` ${className}` : ""}`}
      style={rootStyle}
      aria-label={ariaLabel}
    >
      <div className={styles.shell} aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative lantern art from /public */}
        <img
          className={styles.image}
          src={LANTERN_ASSET_SRC}
          alt=""
          width={LANTERN_IMAGE_WIDTH}
          height={LANTERN_IMAGE_HEIGHT}
          draggable={false}
          decoding="async"
        />
        <span className={styles.flame} />
      </div>

      <div className={styles.content}>
        {bodyOnly ? null : <p className={styles.title}>{title}</p>}
        <p className={styles.body}>{body}</p>
        {bodyOnly || !meta ? null : <p className={styles.meta}>{meta}</p>}
      </div>
    </article>
  );
}

export type { LanternTransform };
