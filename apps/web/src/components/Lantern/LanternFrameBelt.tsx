"use client";

import { memo } from "react";
import { LabelBelt } from "./LabelBelt";
import type { LanternFrameBeltProps } from "./LanternFrameBelt.types";
import { resolveLanternBeltItems } from "./utils/lanternFrameUtils";

/** Label belt under the lantern; a memo boundary so raw-label conversion skips tween frames. */
export const LanternFrameBelt = memo(function LanternFrameBelt({
  labels,
  haikuLabels,
  excludeLabelIds,
}: LanternFrameBeltProps) {
  const beltItems = resolveLanternBeltItems(labels, haikuLabels, excludeLabelIds);
  if (!beltItems) return null;
  return <LabelBelt labels={beltItems} />;
});
