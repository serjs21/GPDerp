"use client";

import { useTranslations } from "next-intl";
import type { HaikuDto } from "@/api/haikus";
import { EMPTY_PATH_PLACEHOLDER_ID } from "./consts/emptyPathPlaceholderConsts";
import type { EmptyPathPlaceholderProps } from "./EmptyPathPlaceholder.types";
import { EnteringPlaceholderLantern } from "./EnteringPlaceholderLantern";
import { ParkedPlaceholderLantern } from "./ParkedPlaceholderLantern";
import { usePathEmptyPlaceholder } from "./usePathEmptyPlaceholder";

function placeholderHaiku(body: string): HaikuDto {
  return {
    id: EMPTY_PATH_PLACEHOLDER_ID,
    title: "",
    titleSuffix: 0,
    body,
    createdAt: "",
    accountId: "",
    createdById: "",
    labels: [],
  };
}

/**
 * Empty-path placeholder: a text lantern on the focus stop with an arrow down at the subject input.
 * Flies away like a deleted haiku as a generation starts; flies in like a created one when the
 * path empties again.
 */
export function EmptyPathPlaceholder({ parsed, eligible, generating }: EmptyPathPlaceholderProps) {
  const t = useTranslations("SVGPath.emptyPlaceholder");
  const { phase, onEnterComplete, onExitComplete } = usePathEmptyPlaceholder({ eligible, generating });
  if (phase === "gone" || !parsed) return null;

  const haiku = placeholderHaiku(t("body"));
  const ariaLabel = t("ariaLabel");

  if (phase === "entering") {
    return (
      <EnteringPlaceholderLantern haiku={haiku} ariaLabel={ariaLabel} parsed={parsed} onComplete={onEnterComplete} />
    );
  }
  return (
    <ParkedPlaceholderLantern
      parsed={parsed}
      haiku={haiku}
      ariaLabel={ariaLabel}
      exiting={phase === "exiting"}
      onExitComplete={onExitComplete}
    />
  );
}
