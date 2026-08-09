"use client";

import type { HaikuContainerProps } from "@/components/HaikuContainer/HaikuContainer";
import { LANTERN_CARD_WIDTH_REM } from "./constants";
import { Lantern } from "./Lantern";
import { LanternFrame } from "./LanternFrame";
import cardStyles from "./LanternCard.module.css";

export type LanternCardProps = HaikuContainerProps & {
  className?: string;
  onDelete?: () => Promise<void>;
  onDeleted?: () => void;
  onChanged?: () => void;
};

export function LanternCard({
  className,
  onDelete,
  onDeleted,
  onChanged,
  ...contentProps
}: LanternCardProps) {
  const generating = "generatingDraft" in contentProps && Boolean(contentProps.generatingDraft);

  if (generating && "generatingDraft" in contentProps && contentProps.generatingDraft) {
    return (
      <LanternFrame
        className={`${cardStyles.root}${className ? ` ${className}` : ""}`}
        contentClassName={cardStyles.content}
        ariaLabel={`Generating haiku: ${contentProps.generatingDraft.subject}`}
        widthRem={LANTERN_CARD_WIDTH_REM}
        generating
      >
        <Lantern generatingDraft={contentProps.generatingDraft} />
      </LanternFrame>
    );
  }

  if (!("haiku" in contentProps) || !contentProps.haiku) {
    return null;
  }

  return (
    <LanternFrame
      className={`${cardStyles.root}${className ? ` ${className}` : ""}`}
      contentClassName={cardStyles.content}
      ariaLabel={`Haiku lantern: ${contentProps.haiku.title}`}
      widthRem={LANTERN_CARD_WIDTH_REM}
    >
      <Lantern
        haiku={contentProps.haiku}
        onDelete={onDelete}
        onDeleted={onDeleted}
        onChanged={onChanged}
      />
    </LanternFrame>
  );
}
