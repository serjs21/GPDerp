import { rotateLabelsWindow } from "./lanternLabelRingLayout";
import {
  buildLabelBeltSlots,
  labelBeltPortalAxisForMove,
  labelBeltPortalTravelSign,
  labelBeltRingNeighbor,
  LABEL_BELT_FILL_ORDER,
  LABEL_BELT_MAX_VISIBLE,
  LABEL_BELT_RING_ORDER,
} from "./labelBeltLayout";

describe("labelBeltLayout", () => {
  it("caps visible slots at six", () => {
    expect(LABEL_BELT_MAX_VISIBLE).toBe(6);
    expect(buildLabelBeltSlots(6)).toHaveLength(6);
    expect(buildLabelBeltSlots(9)).toHaveLength(6);
  });

  it("fills corners before mid spots", () => {
    expect(buildLabelBeltSlots(1).map((s) => s.id)).toEqual(["bl"]);
    expect(buildLabelBeltSlots(2).map((s) => s.id)).toEqual(["bl", "tl"]);
    expect(buildLabelBeltSlots(3).map((s) => s.id)).toEqual(["bl", "tl", "br"]);
    expect(buildLabelBeltSlots(4).map((s) => s.id)).toEqual(["bl", "tl", "br", "tr"]);
    expect(buildLabelBeltSlots(5).map((s) => s.id)).toEqual([
      "bl",
      "tl",
      "br",
      "tr",
      "ml",
    ]);
    expect(LABEL_BELT_FILL_ORDER).toEqual(["bl", "tl", "br", "tr", "ml", "mr"]);
  });

  it("uses ring order when all six slots are occupied", () => {
    const slots = buildLabelBeltSlots(LABEL_BELT_MAX_VISIBLE);
    expect(slots.map((s) => s.id)).toEqual([...LABEL_BELT_RING_ORDER]);
    expect(LABEL_BELT_RING_ORDER).toEqual(["bl", "ml", "tl", "tr", "mr", "br"]);
  });

  it("places left and right columns with sketch tilts", () => {
    const slots = buildLabelBeltSlots(6);
    const byId = Object.fromEntries(slots.map((s) => [s.id, s]));
    expect(byId.bl!.rectX).toBe(-1);
    expect(byId.bl!.rectY).toBeCloseTo(0.85, 5);
    expect(byId.bl!.rotateDeg).toBe(-22);
    expect(byId.tl!.rotateDeg).toBe(22);
    expect(byId.ml!.rotateDeg).toBe(0);
    expect(byId.tr!.rectX).toBe(1);
    expect(byId.tr!.rotateDeg).toBe(-22);
    expect(byId.br!.rotateDeg).toBe(22);
    expect(byId.mr!.rotateDeg).toBe(0);
  });

  it("walks ring neighbors for portal travel", () => {
    expect(labelBeltRingNeighbor("bl", 1)).toBe("ml");
    expect(labelBeltRingNeighbor("br", 1)).toBe("bl");
    expect(labelBeltRingNeighbor("tl", -1)).toBe("ml");
    expect(labelBeltPortalTravelSign("bl", "ml")).toBe(-1);
    expect(labelBeltPortalTravelSign("tl", "tr")).toBe(1);
    expect(labelBeltPortalAxisForMove("bl", "ml")).toBe("y");
    expect(labelBeltPortalAxisForMove("tl", "tr")).toBe("x");
    expect(labelBeltPortalAxisForMove("br", "bl")).toBe("x");
  });

  it("windows more than six labels via rotateLabelsWindow", () => {
    const labels = Array.from({ length: 12 }, (_, i) => ({ id: `l-${i}` }));
    const first = rotateLabelsWindow(labels, 0, LABEL_BELT_MAX_VISIBLE);
    const next = rotateLabelsWindow(labels, 1, LABEL_BELT_MAX_VISIBLE);
    expect(first).toHaveLength(6);
    expect(first[0]!.id).toBe("l-0");
    expect(next[0]!.id).toBe("l-1");
    expect(next[5]!.id).toBe("l-6");
  });
});
