import type { CSSProperties } from "react";
import type { LabelDto } from "@/api/labels";
import { MAGIC_EXIT_BOING_MS } from "../consts/magicAnimationConsts";
import styles from "../ManageLabel.module.css";

const joinClasses = (...classes: Array<string | false>) => classes.filter(Boolean).join(" ");

export function connectedHaikusSummary(label: LabelDto) {
  const total = label.connectedHaikus?.total ?? 0;
  return { total, items: label.connectedHaikus?.items ?? [], hasConnections: total > 0 };
}

export function rowRootClassName(exiting: boolean, collapsing: boolean): string {
  return joinClasses(styles.root, exiting && styles.rootExiting, collapsing && styles.rootCollapsing);
}

export function rowMotionClassName(exiting: boolean, entering: boolean): string {
  return joinClasses(exiting && styles.boingOutDown, entering && styles.boingInUp);
}

/** Staggered entrance delay, or the softened boingOut duration while exiting. */
export function rowMotionStyle(params: {
  entering: boolean;
  exiting: boolean;
  enterDelayMs: number;
}): CSSProperties | undefined {
  if (params.entering && params.enterDelayMs > 0) return { animationDelay: `${params.enterDelayMs}ms` };
  if (params.exiting) return { animationDuration: `${MAGIC_EXIT_BOING_MS}ms` };
  return undefined;
}
