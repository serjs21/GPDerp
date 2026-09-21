"use client";

import type { CSSProperties, ReactNode } from "react";
import { HaikuActions } from "@/components/HaikuContainer/HaikuActions";
import type { HaikuContainerProps } from "@/components/HaikuContainer/HaikuContainer";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import { formatCreatedAt } from "@/utils/date";
import { parseHaikuBody } from "@/utils/parseHaikuBody";
import { formatHaikuTitle } from "@/utils/strings";
import {
  LANTERN_ROTATED_WIDTH_REM,
  type LanternRotatedVariantId,
} from "./consts/rotationBaseConsts";
import styles from "./Lantern.module.css";
import {
  LanternRotatedShell,
  type LanternRotatedFaceHalo,
} from "./LanternRotatedShell";

export type LanternProps = HaikuContainerProps & {
  className?: string;
  style?: CSSProperties;
  /** Show title, body, and author without meta/actions (handwritten-on-paper). */
  bodyOnly?: boolean;
  /** Hover actions; omit during path tween so content stays cheap. */
  showActions?: boolean;
  /**
   * @deprecated Toggle visibility is CSS-driven (hover desktop / always ≤1024).
   * Kept for call-site compatibility.
   */
  actionsAlwaysVisible?: boolean;
  onDelete?: () => Promise<void>;
  onDeleted?: () => void;
  onChanged?: () => void;
  /**
   * When set, renders the rotated base PNG shell with haiku content
   * transformed onto the painted paper face.
   */
  rotationBase?: LanternRotatedVariantId;
  /** Flip horizontally so the painted face follows path direction. */
  mirrored?: boolean;
  /** Shell width when `rotationBase` is set. */
  widthRem?: number;
  /** Horizontal offset of the actions bar relative to lantern center. */
  actionsBarOffsetX?: string;
  /** Vertical gap between lantern bottom and actions bar. */
  actionsBarOffsetY?: string;
  ariaLabel?: string;
  /** LabelHalo on the rotated paper-face plane (same transform as content). */
  faceHalo?: LanternRotatedFaceHalo | null;
};

function resolveGeneratingContent(draft: GeneratingDraft) {
  return {
    title: draft.subject,
    body: draft.content,
    meta: draft.createdAtLabel,
    generating: true,
  };
}

function resolveSavedContent(haiku: NonNullable<HaikuContainerProps["haiku"]>) {
  const title = formatHaikuTitle(haiku);
  return {
    title,
    body: haiku.body,
    meta: formatCreatedAt(haiku.createdAt),
    generating: false,
  };
}

function LanternBodyLines({ body }: { body: string }) {
  const { lines } = parseHaikuBody(body);

  return (
    <div className={styles.bodyLines} aria-label="Haiku">
      {lines.map((line, index) => (
        <p key={index} className={styles.bodyLine}>
          {line || "\u00A0"}
        </p>
      ))}
    </div>
  );
}

function LanternContent({
  title,
  body,
  meta,
  bodyOnly,
  actions,
}: {
  title?: string;
  body: string;
  meta?: string;
  bodyOnly: boolean;
  actions?: ReactNode;
}) {
  const { author } = parseHaikuBody(body);

  if (bodyOnly) {
    return (
      <>
        {title ? <p className={styles.title}>{title}</p> : null}
        <LanternBodyLines body={body} />
        {author ? <p className={styles.author}>—{author}</p> : null}
      </>
    );
  }

  return (
    <>
      {title ? <p className={styles.title}>{title}</p> : null}
      <LanternBodyLines body={body} />
      {author ? <p className={styles.author}>—{author}</p> : null}
      {meta ? <p className={styles.meta}>{meta}</p> : null}
      {actions}
    </>
  );
}

function buildLanternActions(
  props: Pick<
    LanternProps,
    "showActions" | "bodyOnly" | "onDelete" | "onDeleted" | "onChanged" | "haiku" | "generatingDraft"
  >,
  mode: "generating" | "saved",
): ReactNode {
  const bodyOnly = props.bodyOnly ?? false;
  const showActions = props.showActions ?? true;
  if (bodyOnly || !showActions) return undefined;

  return (
    <div className={styles.actions} data-lantern-actions>
      {mode === "generating" ? (
        <HaikuActions variant="generating" />
      ) : "haiku" in props && props.haiku ? (
        <HaikuActions
          variant="saved"
          haiku={props.haiku}
          onDeleted={props.onDeleted}
          onChanged={props.onChanged}
          onDelete={props.onDelete}
        />
      ) : null}
    </div>
  );
}

function resolveHaikuStack(
  props: LanternProps,
  options: { forShell?: boolean } = {},
) {
  const {
    className,
    style,
    bodyOnly = false,
    showActions = true,
    onDelete,
    onDeleted,
    onChanged,
    ...rest
  } = props;
  const noteProps = rest as HaikuContainerProps;

  // Shell owns className/style on the article; content stack stays unstyled.
  const stackClass = [
    styles.haikuStack,
    bodyOnly ? styles.bodyOnly : null,
    options.forShell ? undefined : className,
  ]
    .filter(Boolean)
    .join(" ");
  const stackStyle = options.forShell ? undefined : style;

  if ("generatingDraft" in noteProps && noteProps.generatingDraft) {
    const { title, body, meta } = resolveGeneratingContent(noteProps.generatingDraft);
    return (
      <div className={stackClass} style={stackStyle}>
        <LanternContent
          title={title}
          body={body}
          meta={meta}
          bodyOnly={bodyOnly}
          actions={buildLanternActions(
            { bodyOnly, showActions, generatingDraft: noteProps.generatingDraft },
            "generating",
          )}
        />
      </div>
    );
  }

  if (!("haiku" in noteProps) || !noteProps.haiku) {
    return null;
  }

  const { haiku } = noteProps;
  const { title, body, meta } = resolveSavedContent(haiku);

  return (
    <div className={stackClass} style={stackStyle}>
      <LanternContent
        title={title}
        body={body}
        meta={meta}
        bodyOnly={bodyOnly}
        actions={buildLanternActions(
          { bodyOnly, showActions, haiku, onDelete, onDeleted, onChanged },
          "saved",
        )}
      />
    </div>
  );
}

function resolveRotatedAriaLabel(props: LanternProps): string {
  if (props.ariaLabel) return props.ariaLabel;
  if ("haiku" in props && props.haiku) {
    return `Haiku lantern: ${props.haiku.title ?? ""}`;
  }
  if ("generatingDraft" in props && props.generatingDraft) {
    return `Generating haiku: ${props.generatingDraft.subject}`;
  }
  return "Rotated haiku lantern";
}

export function Lantern(props: LanternProps) {
  if (props.rotationBase) {
    const content = resolveHaikuStack(props, { forShell: true });
    if (!content) return null;

    return (
      <LanternRotatedShell
        rotationBase={props.rotationBase}
        className={props.className}
        style={props.style}
        widthRem={props.widthRem ?? LANTERN_ROTATED_WIDTH_REM}
        mirrored={props.mirrored}
        actionsBarOffsetX={props.actionsBarOffsetX}
        actionsBarOffsetY={props.actionsBarOffsetY}
        ariaLabel={resolveRotatedAriaLabel(props)}
        faceHalo={props.faceHalo}
      >
        {content}
      </LanternRotatedShell>
    );
  }

  return resolveHaikuStack(props);
}

export type { LanternTransform } from "./lanternTransform";
