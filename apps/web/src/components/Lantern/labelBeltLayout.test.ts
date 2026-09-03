import { rotateLabelsWindow } from "./lanternLabelRingLayout";
import {
  buildLabelBeltSlots,
  labelBeltAngleForIndex,
  labelBeltRotateDeg,
  LABEL_BELT_MAX_VISIBLE,
} from "./labelBeltLayout";

describe("labelBeltLayout", () => {
  it("places a single label at top center", () => {
    expect(labelBeltAngleForIndex(0, 1)).toBeCloseTo(-Math.PI / 2, 8);
    const [slot] = buildLabelBeltSlots(1);
    expect(slot!.cos).toBeCloseTo(0, 5);
    expect(slot!.sin).toBeCloseTo(-1, 5);
  });

  it("spreads endpoints to left and right on the upper arc", () => {
    const count = 5;
    expect(labelBeltAngleForIndex(0, count)).toBeCloseTo(-Math.PI, 8);
    expect(labelBeltAngleForIndex(count - 1, count)).toBeCloseTo(0, 8);
    expect(labelBeltAngleForIndex(2, count)).toBeCloseTo(-Math.PI / 2, 8);
  });

  it("builds nine evenly spaced slots for the max visible window", () => {
    const slots = buildLabelBeltSlots(LABEL_BELT_MAX_VISIBLE);
    expect(slots).toHaveLength(9);
    expect(slots[0]!.angleRad).toBeCloseTo(-Math.PI, 8);
    expect(slots[8]!.angleRad).toBeCloseTo(0, 8);
  });

  it("rotates so text sits along the radius; left half flipped +180°", () => {
    expect(labelBeltRotateDeg(-Math.PI / 2)).toBeCloseTo(-90, 5);
    expect(labelBeltRotateDeg(0)).toBeCloseTo(0, 5);
    expect(labelBeltRotateDeg(-Math.PI)).toBeCloseTo(0, 5);
    expect(labelBeltRotateDeg((-3 * Math.PI) / 4)).toBeCloseTo(45, 5);
  });

  it("windows more than nine labels via rotateLabelsWindow", () => {
    const labels = Array.from({ length: 12 }, (_, i) => ({ id: `l-${i}` }));
    const first = rotateLabelsWindow(labels, 0, LABEL_BELT_MAX_VISIBLE);
    const next = rotateLabelsWindow(labels, 1, LABEL_BELT_MAX_VISIBLE);
    expect(first).toHaveLength(9);
    expect(first[0]!.id).toBe("l-0");
    expect(next[0]!.id).toBe("l-1");
    expect(next[8]!.id).toBe("l-9");
  });
});
