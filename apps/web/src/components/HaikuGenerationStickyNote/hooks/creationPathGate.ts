import { SCROLL_TO_TOP_HANDOFF_INDEX } from "@/components/SVGPath/scrollToTop.config";

/** Near path: scroll to top. Far path: open CreationModal. */
export function shouldOpenCreationOverlay(focusIndex: number): boolean {
  return focusIndex >= SCROLL_TO_TOP_HANDOFF_INDEX;
}
