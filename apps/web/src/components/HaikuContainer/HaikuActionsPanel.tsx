"use client";

import { createPortal } from "react-dom";
import { useLanternActionsDock } from "@/components/Lantern/LanternActionsDockContext";
import { PathNavigationArrows, usePathNavigation } from "@/components/PathNavigation";
import type { HaikuActionsPanelProps } from "./HaikuActions.types";
import styles from "./HaikuActions.module.css";

/** Actions panel: portaled into the lantern's actions dock when present, else inline; wrapped by path arrows on the path. */
export function HaikuActionsPanel({ open, onMouseLeave, children }: HaikuActionsPanelProps) {
  const dock = useLanternActionsDock();
  const pathNavigation = usePathNavigation();
  if (!open) return null;

  const panel = (
    <div className={styles.anchor} data-haiku-actions-panel="" onMouseLeave={onMouseLeave}>
      {pathNavigation ? <PathNavigationArrows {...pathNavigation}>{children}</PathNavigationArrows> : children}
    </div>
  );

  return dock ? createPortal(panel, dock) : <div className={styles.inlinePanel}>{panel}</div>;
}
