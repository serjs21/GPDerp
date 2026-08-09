"use client";

import type { ReactNode } from "react";
import { Label } from "@/components/Label/Label";
import { HaikuActions } from "@/components/HaikuContainer/HaikuActions";
import type { HaikuContainerProps } from "@/components/HaikuContainer/HaikuContainer";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import { formatCreatedAt } from "@/utils/date";
import { parseHaikuBody } from "@/utils/parseHaikuBody";
import { formatHaikuTitle } from "@/utils/strings";
import styles from "./Lantern.module.css";

export type LanternProps = HaikuContainerProps & {
  className?: string;
  /** Show only the haiku body (handwritten-on-paper presentation). */
  bodyOnly?: boolean;
  onDelete?: () => Promise<void>;
  onDeleted?: () => void;
  onChanged?: () => void;
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
  footer,
}: {
  title?: string;
  body: string;
  meta?: string;
  bodyOnly: boolean;
  actions?: ReactNode;
  footer?: ReactNode;
}) {
  const { author } = parseHaikuBody(body);

  if (bodyOnly) {
    return <LanternBodyLines body={body} />;
  }

  return (
    <>
      {title ? <p className={styles.title}>{title}</p> : null}
      <LanternBodyLines body={body} />
      {author ? <p className={styles.author}>—{author}</p> : null}
      {meta ? <p className={styles.meta}>{meta}</p> : null}
      {footer}
      {actions}
    </>
  );
}

export function Lantern(props: LanternProps) {
  const {
    className,
    bodyOnly = false,
    onDelete,
    onDeleted,
    onChanged,
    ...noteProps
  } = props;

  const stackClass = [styles.haikuStack, className].filter(Boolean).join(" ");

  if ("generatingDraft" in noteProps && noteProps.generatingDraft) {
    const { title, body, meta } = resolveGeneratingContent(noteProps.generatingDraft);
    return (
      <div className={stackClass}>
        <LanternContent
          title={title}
          body={body}
          meta={meta}
          bodyOnly={bodyOnly}
          actions={
            bodyOnly ? undefined : (
              <div className={styles.actions}>
                <HaikuActions variant="generating" />
              </div>
            )
          }
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
    <div className={stackClass}>
      <LanternContent
        title={title}
        body={body}
        meta={meta}
        bodyOnly={bodyOnly}
        footer={
          bodyOnly || haiku.labels.length === 0 ? undefined : (
            <div className={styles.footer}>
              <div className={styles.labels}>
                {haiku.labels.map((label) => (
                  <Label key={label.id} name={label.name} color={label.color || "default"} />
                ))}
              </div>
            </div>
          )
        }
        actions={
          bodyOnly ? undefined : (
            <div className={styles.actions}>
              <HaikuActions
                variant="saved"
                haiku={haiku}
                onDeleted={onDeleted}
                onChanged={onChanged}
                onDelete={onDelete}
              />
            </div>
          )
        }
      />
    </div>
  );
}

export type { LanternTransform } from "./lanternTransform";
