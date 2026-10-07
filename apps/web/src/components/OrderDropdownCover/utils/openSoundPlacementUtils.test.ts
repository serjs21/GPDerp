import {
  GAVEL_BASE_LEFT_RATIO,
  GAVEL_BASE_VIEWBOX,
  GAVEL_VIEWBOX,
  OPEN_SOUND_MAX_COUNT,
  ORDER_COVER_LABEL_ASPECT,
  ORDER_DROPDOWN_COVER_STAGE,
} from "../consts/orderDropdownCoverConsts";
import { pickOpenSoundPlacement, type OpenSoundPlacement } from "./openSoundPlacementUtils";
import { coverLabelBox, coverLabelPadding, scaleArtPoint } from "./orderDropdownCoverUtils";

function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

describe("coverLabelPadding", () => {
  it("pads the button to the label aspect ratio", () => {
    const padding = coverLabelPadding();
    const width = ORDER_DROPDOWN_COVER_STAGE.width + padding.left + padding.right;
    const height = ORDER_DROPDOWN_COVER_STAGE.height + padding.top + padding.bottom;
    expect(width / height).toBeCloseTo(ORDER_COVER_LABEL_ASPECT, 6);
  });
});

describe("coverArtOffset", () => {
  it("keeps the whole scaled base inside the label", () => {
    const box = coverLabelBox();
    const baseLeft = ORDER_DROPDOWN_COVER_STAGE.width * GAVEL_BASE_LEFT_RATIO;
    const topLeft = scaleArtPoint({ x: baseLeft, y: GAVEL_VIEWBOX.height });
    const bottomRight = scaleArtPoint({
      x: baseLeft + GAVEL_BASE_VIEWBOX.width,
      y: GAVEL_VIEWBOX.height + GAVEL_BASE_VIEWBOX.height,
    });
    expect(topLeft.x).toBeGreaterThanOrEqual(box.left);
    expect(topLeft.y).toBeGreaterThanOrEqual(box.top);
    expect(bottomRight.x).toBeLessThanOrEqual(box.right);
    expect(bottomRight.y).toBeLessThanOrEqual(box.bottom);
  });
});

describe("pickOpenSoundPlacement", () => {
  it("places up to the max count of upright sound effects outside the label, bottom/left of it", () => {
    const box = coverLabelBox();
    const midY = (box.top + box.bottom) / 2;
    const random = seededRandom(7);
    const placed: OpenSoundPlacement[] = [];
    for (let i = 0; i < OPEN_SOUND_MAX_COUNT; i += 1) {
      const placement = pickOpenSoundPlacement(placed, random);
      if (placement) placed.push(placement);
    }
    expect(placed.length).toBeGreaterThan(0);
    for (const { cx, cy, deg } of placed) {
      expect(cx < box.left || cy > box.bottom).toBe(true);
      expect(cy).toBeGreaterThanOrEqual(midY);
      expect(Math.abs(deg)).toBeLessThanOrEqual(90);
    }
  });
});
