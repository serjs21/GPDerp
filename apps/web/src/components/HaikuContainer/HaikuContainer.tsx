"use client";

import { motion } from "motion/react";
import type { HaikuDto } from "@/api/haikus";
import { Label } from "@/components/Label/Label";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import { formatCreatedAt } from "@/utils/date";
import { formatHaikuTitle } from "@/utils/strings";
import { HaikuActions } from "./HaikuActions";
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
        initial={{ opacity: 0, x: -100, y: -20, minHeight: 0, height: 0 }}
        animate={{ opacity: 1, x: 0, y: 0, minHeight: "185px", height: "fit-content" }}
        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
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
