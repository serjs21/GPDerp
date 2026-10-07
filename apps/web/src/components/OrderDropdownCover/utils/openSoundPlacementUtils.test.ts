import { OPEN_SOUND_MAX_COUNT, ORDER_DROPDOWN_COVER_STAGE } from "../consts/orderDropdownCoverConsts";
import { pickOpenSoundPlacement, type OpenSoundPlacement } from "./openSoundPlacementUtils";
import { coverLabelBox, coverLabelPadding } from "./orderDropdownCoverUtils";

function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

describe("coverLabelPadding", () => {
  it("pads the button into a square", () => {
    const padding = coverLabelPadding();
    const width = ORDER_DROPDOWN_COVER_STAGE.width + padding.left + padding.right;
    const height = ORDER_DROPDOWN_COVER_STAGE.height + padding.top + padding.bottom;
    expect(width).toBeCloseTo(height, 6);
  });
});

describe("pickOpenSoundPlacement", () => {
  it("places up to the max count of sound effects outside the label, top/left of it", () => {
    const box = coverLabelBox();
    const random = seededRandom(7);
    const placed: OpenSoundPlacement[] = [];
    for (let i = 0; i < OPEN_SOUND_MAX_COUNT; i += 1) {
      const placement = pickOpenSoundPlacement(placed, random);
      if (placement) placed.push(placement);
    }
    expect(placed.length).toBeGreaterThan(0);
    for (const { cx, cy } of placed) {
      expect(cx < box.left || cy < box.top).toBe(true);
    }
  });
});
