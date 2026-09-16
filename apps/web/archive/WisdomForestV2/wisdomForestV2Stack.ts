import type { HaikuDto } from "@/api/haikus";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";

export const STACK_CARD_HEIGHT_REM = 12.5;
export const STACK_CARD_GAP_REM = 1;
export const STACK_SLOT_HEIGHT_REM = STACK_CARD_HEIGHT_REM + STACK_CARD_GAP_REM;
export const STACK_TOP_REM = 1.25;
export const STACK_SCALE_BASE = 1;
export const STACK_SCALE_STEP = 0.08;
export const STACK_LIFT_STEP_REM = 0.65;

export function getWisdomForestV2CardCount(
  haikus: HaikuDto[],
  generatingDraft: GeneratingDraft | null,
): number {
  return haikus.length + (generatingDraft ? 1 : 0);
}

export function getRootFontSizePx(root: HTMLElement): number {
  const fontSize = Number.parseFloat(getComputedStyle(root).fontSize);
  return Number.isFinite(fontSize) && fontSize > 0 ? fontSize : 16;
}

export function getStackSlotHeightPx(rootFontSizePx: number): number {
  return STACK_SLOT_HEIGHT_REM * rootFontSizePx;
}

export function getMaxContentScrollTop(cardCount: number, slotHeightPx: number): number {
  return getScrollTopForCardIndex(Math.max(0, cardCount - 1), slotHeightPx);
}

export function getDefaultScrollTop(cardCount: number, slotHeightPx: number): number {
  return getMaxContentScrollTop(cardCount, slotHeightPx);
}

export function getActiveCardIndex(
  scrollTop: number,
  slotHeightPx: number,
  cardCount: number,
): number {
  if (cardCount <= 0 || slotHeightPx <= 0) return 0;
  return Math.max(0, Math.min(cardCount - 1, Math.round(scrollTop / slotHeightPx)));
}

export function getScrollTopForCardIndex(index: number, slotHeightPx: number): number {
  return index * slotHeightPx;
}

export function getReverseIndex(index: number, cardCount: number): number {
  const index0 = index - 1;
  return cardCount - index0;
}

export function getReverseIndex0(index: number, cardCount: number): number {
  return getReverseIndex(index, cardCount) - 1;
}

export function getStackScale(reverseIndex0: number): number {
  return Math.max(0, STACK_SCALE_BASE - STACK_SCALE_STEP * reverseIndex0);
}

export function getStackLiftRem(reverseIndex0: number): number {
  return reverseIndex0 * STACK_LIFT_STEP_REM;
}

export function getAnimationRangePercents(
  index: number,
  cardCount: number,
): { start: string; end: string } {
  const index0 = index - 1;
  const start = (index0 / cardCount) * 100;
  const end = (index / cardCount) * 100;
  return { start: `${start}%`, end: `${end}%` };
}
