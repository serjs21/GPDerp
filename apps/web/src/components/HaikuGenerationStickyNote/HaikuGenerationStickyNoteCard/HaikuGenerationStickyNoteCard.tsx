"use client";

import { motion } from "motion/react";
import type { HaikuDto } from "@/api/haikus";
import { Label } from "@/components/Label/Label";
import { formatCreatedAt } from "@/utils/date";
import { formatHaikuTitle } from "@/utils/strings";
import { HaikuActions } from "@/components/HaikuContainer/HaikuActions";
import type { HaikuContainerProps } from "@/components/HaikuContainer/HaikuContainer";
import { HaikuGenerationStickyNoteShell } from "../HaikuGenerationStickyNoteShell/HaikuGenerationStickyNoteShell";
import styles from "./HaikuGenerationStickyNoteCard.module.css";

export function HaikuGenerationStickyNoteCard(props: HaikuContainerProps) {
  if ("generatingDraft" in props && props.generatingDraft) {
    const { subject, content, createdAtLabel } = props.generatingDraft;

    return (
      <motion.div
        className={styles.card}
        layout
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <HaikuGenerationStickyNoteShell
          actions={<HaikuActions variant="generating" />}
          title={subject}
          meta={createdAtLabel}
          body={content}
          rotate={0.6}
        />
      </motion.div>
    );
  }

  const { haiku, onDeleted, onChanged } = props as {
    haiku: HaikuDto;
    onDeleted?: () => void;
    onChanged?: () => void;
  };

  return (
    <motion.div className={styles.card} layout>
      <HaikuGenerationStickyNoteShell
        actions={
          <HaikuActions variant="saved" haiku={haiku} onDeleted={onDeleted} onChanged={onChanged} />
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
    </motion.div>
  );
}
