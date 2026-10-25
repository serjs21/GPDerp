"use client";

import { LanternSteppedFlight } from "@/components/Lantern/LanternSteppedFlight";
import type { ExitingPlaceholderLanternProps } from "./EmptyPathPlaceholder.types";
import { defaultStopLanternTransform } from "./utils/lanternDisplay";
import styles from "./SVGPath.module.css";

/** Placeholder flying away from the focus stop like a deleted haiku. */
export function ExitingPlaceholderLantern({ parsed, haiku, onExitComplete }: ExitingPlaceholderLanternProps) {
  const focusTransform = defaultStopLanternTransform(parsed);
  if (!focusTransform) return null;

  return (
    <LanternSteppedFlight
      haiku={haiku}
      transform={focusTransform}
      className={styles.lantern}
      showMeta={false}
      onComplete={onExitComplete}
    />
  );
}
