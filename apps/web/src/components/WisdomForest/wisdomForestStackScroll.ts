export const STACK_SLOT_HEIGHT_VH = 12;
export const STACK_TOP_REM = 1.25;
export const STACK_SCALE_STEP = 0.1;
export const STACK_TAB_STEP_REM = 0.65;

export function getStackSlotHeightPx(viewportHeightPx: number): number {
  return (viewportHeightPx * STACK_SLOT_HEIGHT_VH) / 100;
}

export function getCardsListBottomPaddingPx(viewportHeightPx: number): number {
  return viewportHeightPx - getStackSlotHeightPx(viewportHeightPx);
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

export function computeStackStep(
  currentScrollTop: number,
  direction: -1 | 1,
  slotHeightPx: number,
  maxScroll: number,
  cardCount: number,
): { scrollTop: number; activeCardIndex: number } {
  const nextTop = Math.max(
    0,
    Math.min(maxScroll, currentScrollTop + direction * slotHeightPx),
  );
  return {
    scrollTop: nextTop,
    activeCardIndex: getActiveCardIndex(nextTop, slotHeightPx, cardCount),
  };
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

export function getStackScale(reverseIndex0: number): number {
  return Math.max(0, 1 - STACK_SCALE_STEP * reverseIndex0);
}

export function getStackStickyTopRem(index: number): number {
  return STACK_TOP_REM + (index - 1) * STACK_TAB_STEP_REM;
}

export function getReverseIndex0(index: number, cardCount: number): number {
  const index0 = index - 1;
  const reverseIndex = cardCount - index0;
  return reverseIndex - 1;
}
