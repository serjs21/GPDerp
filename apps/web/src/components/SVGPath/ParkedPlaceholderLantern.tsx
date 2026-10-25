"use client";

import { LanternSteppedFlight } from "@/components/Lantern/LanternSteppedFlight";
import { EmptyPathPlaceholderLantern } from "./EmptyPathPlaceholderLantern";
import type { ParkedPlaceholderLanternProps } from "./EmptyPathPlaceholder.types";
import { defaultStopLanternTransform } from "./utils/lanternDisplay";
import styles from "./SVGPath.module.css";

/** Placeholder on the focus stop with its arrow, or flying away from it like a deleted haiku. */
export function ParkedPlaceholderLantern({
  parsed,
  haiku,
  ariaLabel,
  exiting,
  onExitComplete,
}: ParkedPlaceholderLanternProps) {
  const focusTransform = defaultStopLanternTransform(parsed);
  if (!focusTransform) return null;

  return exiting ? (
    <LanternSteppedFlight
      haiku={haiku}
      transform={focusTransform}
      className={styles.lantern}
      showMeta={false}
      onComplete={onExitComplete}
    />
  ) : (
    <EmptyPathPlaceholderLantern
      haiku={haiku}
      transform={focusTransform}
      ariaLabel={ariaLabel}
      isAnimating={false}
      showArrow
    />
  );
}
