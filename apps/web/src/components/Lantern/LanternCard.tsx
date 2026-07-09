"use client";

import type { HaikuDto } from "@/api/haikus";
import { Label } from "@/components/Label/Label";
import { HaikuActions } from "@/components/HaikuContainer/HaikuActions";
import type { HaikuContainerProps } from "@/components/HaikuContainer/HaikuContainer";
import { formatCreatedAt } from "@/utils/date";
import { formatHaikuTitle } from "@/utils/strings";
import { LANTERN_CARD_WIDTH_REM } from "./constants";
import { LanternFrame } from "./LanternFrame";
import cardStyles from "./LanternCard.module.css";

export type LanternCardProps = HaikuContainerProps & {
  className?: string;
  onDelete?: () => Promise<void>;
};

export function LanternCard(props: LanternCardProps) {
  if ("generatingDraft" in props && props.generatingDraft) {
    const { subject, content, createdAtLabel } = props.generatingDraft;

    return (
      <LanternFrame
        className={`${cardStyles.root}${props.className ? ` ${props.className}` : ""}`}
        contentClassName={cardStyles.content}
        ariaLabel={`Generating haiku: ${subject}`}
        widthRem={LANTERN_CARD_WIDTH_REM}
        generating
      >
        <div className={cardStyles.actions}>
          <HaikuActions variant="generating" />
        </div>
        <p className={cardStyles.title}>{subject}</p>
        <p className={cardStyles.meta}>{createdAtLabel}</p>
        <p className={cardStyles.body}>{content}</p>
      </LanternFrame>
    );
  }

  const { haiku, onDeleted, onChanged, onDelete, className } = props as {
    haiku: HaikuDto;
    onDeleted?: () => void;
    onChanged?: () => void;
    onDelete?: () => Promise<void>;
    className?: string;
  };

  const title = formatHaikuTitle(haiku);

  return (
    <LanternFrame
      className={`${cardStyles.root}${className ? ` ${className}` : ""}`}
      contentClassName={cardStyles.content}
      ariaLabel={`Haiku lantern: ${title}`}
      widthRem={LANTERN_CARD_WIDTH_REM}
    >
      <div className={cardStyles.actions}>
        <HaikuActions
          variant="saved"
          haiku={haiku}
          onDeleted={onDeleted}
          onChanged={onChanged}
          onDelete={onDelete}
        />
      </div>
      <p className={cardStyles.title}>{title}</p>
      <p className={cardStyles.meta}>{formatCreatedAt(haiku.createdAt)}</p>
      <p className={cardStyles.body}>{haiku.body}</p>
      {haiku.labels.length > 0 ? (
        <div className={cardStyles.footer}>
          <div className={cardStyles.labels}>
            {haiku.labels.map((label) => (
              <Label key={label.id} name={label.name} color={label.color || "default"} />
            ))}
          </div>
        </div>
      ) : null}
    </LanternFrame>
  );
}
