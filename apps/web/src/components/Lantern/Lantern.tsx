"use client";

import { Label } from "@/components/Label/Label";
import { HaikuActions } from "@/components/HaikuContainer/HaikuActions";
import type { HaikuContainerProps } from "@/components/HaikuContainer/HaikuContainer";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import { formatCreatedAt } from "@/utils/date";
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

export function Lantern(props: LanternProps) {
  const {
    className,
    bodyOnly = false,
    onDelete,
    onDeleted,
    onChanged,
    ...noteProps
  } = props;

  const contentClass = [styles.content, className].filter(Boolean).join(" ");

  if ("generatingDraft" in noteProps && noteProps.generatingDraft) {
    const { title, body, meta } = resolveGeneratingContent(noteProps.generatingDraft);
    return (
      <div className={contentClass}>
        {bodyOnly ? null : (
          <div className={styles.actions}>
            <HaikuActions variant="generating" />
          </div>
        )}
        {bodyOnly ? null : <p className={styles.title}>{title}</p>}
        <p className={styles.body}>{body}</p>
        {bodyOnly || !meta ? null : <p className={styles.meta}>{meta}</p>}
      </div>
    );
  }

  if (!("haiku" in noteProps) || !noteProps.haiku) {
    return null;
  }

  const { haiku } = noteProps;
  const { title, body, meta } = resolveSavedContent(haiku);

  return (
    <div className={contentClass}>
      {bodyOnly ? null : (
        <div className={styles.actions}>
          <HaikuActions
            variant="saved"
            haiku={haiku}
            onDeleted={onDeleted}
            onChanged={onChanged}
            onDelete={onDelete}
          />
        </div>
      )}
      {bodyOnly ? null : <p className={styles.title}>{title}</p>}
      <p className={styles.body}>{body}</p>
      {bodyOnly || !meta ? null : <p className={styles.meta}>{meta}</p>}
      {bodyOnly || haiku.labels.length === 0 ? null : (
        <div className={styles.footer}>
          <div className={styles.labels}>
            {haiku.labels.map((label) => (
              <Label key={label.id} name={label.name} color={label.color || "default"} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export type { LanternTransform } from "./lanternTransform";
