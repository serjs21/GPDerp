"use client";

import { motion } from "motion/react";
import type { HaikuDto } from "@/api/haikus";
import { Label } from "@/components/Label/Label";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import { formatCreatedAt } from "@/utils/date";
import { formatHaikuTitle } from "@/utils/strings";
import { HaikuActions } from "./HaikuActions";
import { GENERATING_HAIKU_CARD_MOTION } from "./haikuCardMotion";
import styles from "./HaikuContainer.module.css";

export type HaikuContainerProps =
  | {
      haiku: HaikuDto;
      onDeleted?: () => void;
      onChanged?: () => void;
      generatingDraft?: undefined;
    }
  | {
      generatingDraft: GeneratingDraft;
      haiku?: undefined;
      onDeleted?: undefined;
      onChanged?: undefined;
    };

export const HaikuContainer = (props: HaikuContainerProps) => {
  if ("generatingDraft" in props && props.generatingDraft) {
    const { subject, content, createdAtLabel } = props.generatingDraft;

    return (
      <motion.article
        className={styles.root}
        initial={GENERATING_HAIKU_CARD_MOTION.initial}
        animate={GENERATING_HAIKU_CARD_MOTION.animate}
        transition={GENERATING_HAIKU_CARD_MOTION.transition}
      >
        <div className={styles.actions}>
          <HaikuActions variant="generating" />
        </div>
        <div className={styles.titleRow}>{subject}</div>
        <div className={styles.meta}>{createdAtLabel}</div>
        <div className={styles.body}>{content}</div>
      </motion.article>
    );
  }

  const { haiku, onDeleted, onChanged } = props as {
    haiku: HaikuDto;
    onDeleted?: () => void;
    onChanged?: () => void;
  };

  return (
    <article className={styles.root}>
      <div className={styles.actions}>
        <HaikuActions variant="saved" haiku={haiku} onDeleted={onDeleted} onChanged={onChanged} />
      </div>
      <div className={styles.titleRow}>{formatHaikuTitle(haiku)}</div>
      <div className={styles.meta}>{formatCreatedAt(haiku.createdAt)}</div>
      <div className={styles.body}>{haiku.body}</div>
      <div className={styles.labels}>
        {haiku.labels.map((label) => (
          <Label key={label.id} name={label.name} color={label.color || "default"} />
        ))}
      </div>
    </article>
  );
};
