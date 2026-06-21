"use client";

import type { HaikuDto } from "@/api/haikus";
import { Label } from "@/components/Label/Label";
import { formatCreatedAt } from "@/utils/date";
import { formatHaikuTitle } from "@/utils/strings";
import { HaikuActions } from "@/components/HaikuContainer/HaikuActions";
import type { HaikuContainerProps } from "@/components/HaikuContainer/HaikuContainer";
import { HaikuGenerationStickyNoteShell } from "../HaikuGenerationStickyNoteShell/HaikuGenerationStickyNoteShell";
import shellStyles from "../HaikuGenerationStickyNoteShell/HaikuGenerationStickyNoteShell.module.css";
import styles from "./HaikuGenerationStickyNoteCard.module.css";

export type HaikuGenerationStickyNoteCardProps = HaikuContainerProps & {
  onDelete?: () => Promise<void>;
};

export function HaikuGenerationStickyNoteCard(props: HaikuGenerationStickyNoteCardProps) {
  if ("generatingDraft" in props && props.generatingDraft) {
    const { subject, content, createdAtLabel } = props.generatingDraft;

    return (
      <div className={styles.card} data-haiku-generating>
        <HaikuGenerationStickyNoteShell
          className={shellStyles.shellFill}
          actions={<HaikuActions variant="generating" />}
          title={subject}
          meta={createdAtLabel}
          body={content}
          rotate={0.6}
        />
      </div>
    );
  }

  const { haiku, onDeleted, onChanged, onDelete } = props as {
    haiku: HaikuDto;
    onDeleted?: () => void;
    onChanged?: () => void;
    onDelete?: () => Promise<void>;
  };

  return (
    <div className={styles.card}>
      <HaikuGenerationStickyNoteShell
        className={shellStyles.shellFill}
        actions={
          <HaikuActions
            variant="saved"
            haiku={haiku}
            onDeleted={onDeleted}
            onChanged={onChanged}
            onDelete={onDelete}
          />
        }
        title={formatHaikuTitle(haiku)}
        meta={formatCreatedAt(haiku.createdAt)}
        body={haiku.body}
        footer={
          haiku.labels.length > 0 ? (
            <div className={styles.labels}>
              {haiku.labels.map((label) => (
                <Label key={label.id} name={label.name} color={label.color || "default"} />
              ))}
            </div>
          ) : undefined
        }
        rotate={-0.8}
      />
    </div>
  );
}
