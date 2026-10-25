"use client";

import type { CSSProperties, ReactNode } from "react";
import { useTranslations } from "next-intl";
import { HaikuActions } from "@/components/HaikuContainer/HaikuActions";
import type { HaikuContainerProps } from "@/components/HaikuContainer/HaikuContainer";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import { LocalDateTime } from "@/components/LocalDateTime";
import { formatHaikuTitle } from "@/utils/strings";
import { TextTyping } from "@/components/TextTyping/TextTyping";
import { haikuTitleTypingStyle } from "@/utils/haikuTyping/haikuTypingUtils";
import { lanternContentTyping } from "./utils/lanternContentUtils";
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
  /** Saved haiku's date line under the text; off for placeholder lanterns. Defaults to true. */
  showMeta?: boolean;
  onDelete?: () => Promise<void>;
  onDeleted?: () => void;
  onChanged?: () => void;
  /**
   * When set, renders the rotated base PNG shell with haiku content
   * transformed onto the painted paper face.
   */
  rotationBase?: LanternRotatedVariantId;
  /** Flip base PNG horizontally; face gets reverse skew (text stays readable). */
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
  /**
   * Chunk-by-chunk typing reveal of title, body, and author (TextTyping).
   * Start can be deferred via the inherited `--text-typing-delay` CSS var.
   */
  typing?: boolean;
};

function resolveGeneratingContent(draft: GeneratingDraft) {
  return {
    title: draft.subject,
    body: draft.content,
    meta: draft.createdAtLabel,
    generating: true,
  };
}

function resolveSavedContent(haiku: NonNullable<HaikuContainerProps["haiku"]>, showMeta: boolean) {
  const title = formatHaikuTitle(haiku);
  return {
    title,
    body: haiku.body,
    meta: showMeta ? <LocalDateTime iso={haiku.createdAt} /> : undefined,
    generating: false,
  };
}

/** Renders `text` as-is, or chunk-revealed from `startIndex` when typing. */
function LanternText({
  text,
  typing,
  startIndex,
}: {
  text: string;
  typing: boolean;
  startIndex: number;
}) {
  return typing ? <TextTyping text={text} startIndex={startIndex} /> : <>{text}</>;
}

function LanternBodyLines({
  lines,
  typing,
  lineStarts,
}: {
  lines: string[];
  typing: boolean;
  lineStarts: number[];
}) {
  const t = useTranslations("Lantern.lantern");
  return (
    <div className={styles.bodyLines} aria-label={t("bodyAriaLabel")}>
      {lines.map((line, index) => (
        <p key={index} className={styles.bodyLine}>
          {line ? (
            <LanternText text={line} typing={typing} startIndex={lineStarts[index]} />
          ) : (
            "\u00A0"
          )}
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
  typing,
  titleTyping,
  actions,
}: {
  title?: string;
  body: string;
  meta?: ReactNode;
  bodyOnly: boolean;
  typing: boolean;
  /** Typing reveal for the title alone (generating drafts: the body streams in instead). */
  titleTyping: boolean;
  actions?: ReactNode;
}) {
  const { lines, authorText, lineStarts, authorStart } = lanternContentTyping(title, body);

  const shared = (
    <>
      {title ? (
        <p className={styles.title}>
          <LanternText text={title} typing={titleTyping} startIndex={0} />
        </p>
      ) : null}
      <LanternBodyLines lines={lines} typing={typing} lineStarts={lineStarts} />
      {authorText ? (
        <p className={styles.author}>
          <LanternText text={authorText} typing={typing} startIndex={authorStart} />
        </p>
      ) : null}
    </>
  );

  if (bodyOnly) return shared;

  return (
    <>
      {shared}
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
    showMeta,
    typing = false,
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
      <div className={stackClass} style={{ ...stackStyle, ...haikuTitleTypingStyle() }}>
        <LanternContent
          title={title}
          body={body}
          meta={meta}
          bodyOnly={bodyOnly}
          typing={typing}
          titleTyping
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
  const { title, body, meta } = resolveSavedContent(haiku, showMeta !== false);

  return (
    <div className={stackClass} style={stackStyle}>
      <LanternContent
        title={title}
        body={body}
        meta={meta}
        bodyOnly={bodyOnly}
        typing={typing}
        titleTyping={typing}
        actions={buildLanternActions(
          { bodyOnly, showActions, haiku, onDelete, onDeleted, onChanged },
          "saved",
        )}
      />
    </div>
  );
}

function resolveRotatedAriaLabel(
  props: LanternProps,
  t: ReturnType<typeof useTranslations>,
): string {
  if (props.ariaLabel) return props.ariaLabel;
  if ("haiku" in props && props.haiku) {
    return t("haikuLantern", { title: props.haiku.title ?? "" });
  }
  if ("generatingDraft" in props && props.generatingDraft) {
    return t("generating", { subject: props.generatingDraft.subject });
  }
  return t("rotatedLantern");
}

export function Lantern(props: LanternProps) {
  const t = useTranslations("Lantern.lantern");
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
        ariaLabel={resolveRotatedAriaLabel(props, t)}
        faceHalo={props.faceHalo}
      >
        {content}
      </LanternRotatedShell>
    );
  }

  return resolveHaikuStack(props);
}

export type { LanternTransform } from "./lanternTransform";
