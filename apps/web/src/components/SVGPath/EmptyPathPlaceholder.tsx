"use client";

import { useTranslations } from "next-intl";
import type { EmptyPathPlaceholderProps } from "./EmptyPathPlaceholder.types";
import { ExitingPlaceholderLantern } from "./ExitingPlaceholderLantern";
import { ShownPlaceholderLantern } from "./ShownPlaceholderLantern";
import { usePathEmptyPlaceholder } from "./usePathEmptyPlaceholder";
import { emptyPathPlaceholderContent } from "./utils/emptyPathPlaceholderUtils";

/**
 * Empty-path placeholder: a text lantern on the focus stop, with an arrow down at what sits below
 * the path. Flies away like a deleted haiku as a generation starts; flies in like a created one
 * when the path empties again.
 */
export function EmptyPathPlaceholder({ parsed, variant, eligible, generating }: EmptyPathPlaceholderProps) {
  const t = useTranslations("SVGPath");
  const { phase, onEnterComplete, onExitComplete } = usePathEmptyPlaceholder({ eligible, generating });
  if (phase === "gone" || !parsed) return null;

  const { haiku, ariaLabel, showArrow } = emptyPathPlaceholderContent(variant, t);

  return phase === "exiting" ? (
    <ExitingPlaceholderLantern parsed={parsed} haiku={haiku} onExitComplete={onExitComplete} />
  ) : (
    <ShownPlaceholderLantern
      parsed={parsed}
      haiku={haiku}
      ariaLabel={ariaLabel}
      showArrow={showArrow}
      entering={phase === "entering"}
      onEnterComplete={onEnterComplete}
    />
  );
}
