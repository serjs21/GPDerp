"use client";

import { useTranslations } from "next-intl";
import type { HaikuDto } from "@/api/haikus";
import { EMPTY_PATH_PLACEHOLDER_ID } from "./consts/emptyPathPlaceholderConsts";
import type { EmptyPathPlaceholderProps } from "./EmptyPathPlaceholder.types";
import { ExitingPlaceholderLantern } from "./ExitingPlaceholderLantern";
import { ShownPlaceholderLantern } from "./ShownPlaceholderLantern";
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

  return phase === "exiting" ? (
    <ExitingPlaceholderLantern parsed={parsed} haiku={haiku} onExitComplete={onExitComplete} />
  ) : (
    <ShownPlaceholderLantern
      parsed={parsed}
      haiku={haiku}
      ariaLabel={ariaLabel}
      entering={phase === "entering"}
      onEnterComplete={onEnterComplete}
    />
  );
}
