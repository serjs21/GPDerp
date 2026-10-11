"use client";

import type { LabelBeltBlockProps } from "./LabelBelt.types";
import { LabelBeltBurst } from "./LabelBeltBurst";
import styles from "./LabelBelt.module.css";

/** Outgoing or incoming flow block inside a slot's portal stack (registered for the wipe). */
export function LabelBeltBlock({ slotId, layer, setLayerRef, label, puffDelayMs, onPuffEnd }: LabelBeltBlockProps) {
  return (
    <div className={styles.portalBlock} data-belt-layer={layer} ref={(el) => setLayerRef(slotId, layer, el)}>
      <LabelBeltBurst label={label} puffDelayMs={puffDelayMs} onPuffEnd={onPuffEnd} />
    </div>
  );
}
