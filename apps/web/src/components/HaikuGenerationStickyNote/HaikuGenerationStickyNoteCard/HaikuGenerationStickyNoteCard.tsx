"use client";

import { useState } from "react";
import { motion } from "motion/react";
import type { HaikuDto } from "@/api/haikus";
import { Label } from "@/components/Label/Label";
import { GENERATING_HAIKU_CARD_MOTION } from "@/components/HaikuContainer/haikuCardMotion";
import { formatCreatedAt } from "@/utils/date";
import { formatHaikuTitle } from "@/utils/strings";
import { HaikuActions } from "@/components/HaikuContainer/HaikuActions";
import type { HaikuContainerProps } from "@/components/HaikuContainer/HaikuContainer";
import { HaikuGenerationStickyNoteShell } from "../HaikuGenerationStickyNoteShell/HaikuGenerationStickyNoteShell";
import styles from "./HaikuGenerationStickyNoteCard.module.css";

function GeneratingStickyNoteCard({
  subject,
  content,
  createdAtLabel,
}: {
  subject: string;
  content: string;
  createdAtLabel: string;
}) {
  const [entryComplete, setEntryComplete] = useState(false);

  return (
    <motion.div
      className={styles.card}
      data-haiku-generating
      initial={GENERATING_HAIKU_CARD_MOTION.initial}
      animate={GENERATING_HAIKU_CARD_MOTION.animate}
      transition={GENERATING_HAIKU_CARD_MOTION.transition}
      style={{ overflow: entryComplete ? "visible" : "hidden" }}
      onAnimationComplete={() => setEntryComplete(true)}
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

export function HaikuGenerationStickyNoteCard(props: HaikuContainerProps) {
  if ("generatingDraft" in props && props.generatingDraft) {
    const { subject, content, createdAtLabel } = props.generatingDraft;

    return (
      <GeneratingStickyNoteCard
        key={props.generatingDraft.requestId}
        subject={subject}
        content={content}
        createdAtLabel={createdAtLabel}
      />
    );
  }

  const { haiku, onDeleted, onChanged } = props as {
    haiku: HaikuDto;
    onDeleted?: () => void;
    onChanged?: () => void;
  };

  return (
    <div className={styles.card}>
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
    </div>
  );
}
