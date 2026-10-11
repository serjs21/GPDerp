"use client";

import type { LabelBeltSlotStackProps } from "./LabelBelt.types";
import { LabelBeltBlock } from "./LabelBeltBlock";
import styles from "./LabelBelt.module.css";
import { labelBeltSlotStyle, labelBeltSlotTravelSign, portalStackChildren } from "./utils/labelBeltRenderUtils";

/** One belt stop: clipping portal with the idle label, or both labels mid-wipe. */
export function LabelBeltSlotStack({
  slot,
  transitionDelta,
  setLayerRef,
  puffDelays,
  onPuffEnd,
}: LabelBeltSlotStackProps) {
  const innFirst = labelBeltSlotTravelSign(slot.id, transitionDelta) > 0;

  // Key by label id so the entering node can reconcile into idle without remount.
  const outBlock = (
    <LabelBeltBlock
      key={slot.out.id}
      slotId={slot.id}
      layer="out"
      setLayerRef={setLayerRef}
      label={slot.out}
      puffDelayMs={puffDelays[slot.out.id]}
      onPuffEnd={() => onPuffEnd(slot.out.id)}
    />
  );
  const innBlock = slot.inn ? (
    <LabelBeltBlock
      key={slot.inn.id}
      slotId={slot.id}
      layer="inn"
      setLayerRef={setLayerRef}
      label={slot.inn}
      puffDelayMs={puffDelays[slot.inn.id]}
      onPuffEnd={() => onPuffEnd(slot.inn!.id)}
    />
  ) : null;

  return (
    <div
      className={styles.slot}
      data-belt-slot={slot.id}
      data-belt-side={slot.side}
      style={labelBeltSlotStyle(slot)}
    >
      <div className={styles.portal}>
        <div className={styles.portalStack} ref={(el) => setLayerRef(slot.id, "stack", el)}>
          {portalStackChildren(outBlock, innBlock, innFirst)}
        </div>
      </div>
    </div>
  );
}
