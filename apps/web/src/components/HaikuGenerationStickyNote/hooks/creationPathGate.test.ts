import { SCROLL_TO_TOP_HANDOFF_INDEX } from "@/components/SVGPath/scrollToTop.config";
import { shouldOpenCreationOverlay } from "./creationPathGate";

describe("shouldOpenCreationOverlay", () => {
  it("keeps near focuses on the path (below handoff)", () => {
    expect(shouldOpenCreationOverlay(0)).toBe(false);
    expect(shouldOpenCreationOverlay(SCROLL_TO_TOP_HANDOFF_INDEX - 1)).toBe(false);
  });

  it("opens overlay at and past handoff", () => {
    expect(shouldOpenCreationOverlay(SCROLL_TO_TOP_HANDOFF_INDEX)).toBe(true);
    expect(shouldOpenCreationOverlay(15)).toBe(true);
  });
});
