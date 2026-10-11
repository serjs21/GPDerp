"use client";

import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { formatComicLabelText } from "@/components/ComicBurstLabel/formatComicLabelText";
import { resolveComicLabelShapePreset } from "@/components/ComicLabelCreationModal/comicLabelShapes";
import type { LabelBeltBurstProps } from "./LabelBelt.types";
import { labelBeltPuffStyle, puffInEndHandler } from "./utils/labelBeltRenderUtils";

/** One belt label burst; puffs in (with stagger delay) when newly added. */
export function LabelBeltBurst({ label, puffDelayMs, onPuffEnd }: LabelBeltBurstProps) {
  const preset = resolveComicLabelShapePreset(label.shape);
  const puffing = puffDelayMs != null;
  return (
    <div
      className={puffing ? "magictime puffIn" : undefined}
      style={labelBeltPuffStyle(puffDelayMs)}
      onAnimationEnd={puffing ? puffInEndHandler(onPuffEnd) : undefined}
    >
      <ComicBurstLabel
        text={formatComicLabelText(label.name)}
        fill={label.color}
        shapeKind={preset.kind}
        spikeCount={preset.spikeCount}
        randomness={preset.randomness}
        seed={preset.id}
      />
    </div>
  );
}
