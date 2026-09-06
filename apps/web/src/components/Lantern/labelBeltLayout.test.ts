import { rotateLabelsWindow } from "./lanternLabelRingLayout";
import { LABEL_BELT_STOPS } from "./config";
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

  it("fills clockwise from bottom-left", () => {
    expect(buildLabelBeltSlots(1).map((s) => s.id)).toEqual(["bl"]);
    expect(buildLabelBeltSlots(2).map((s) => s.id)).toEqual(["bl", "br"]);
    expect(buildLabelBeltSlots(3).map((s) => s.id)).toEqual(["bl", "br", "mr"]);
    expect(buildLabelBeltSlots(4).map((s) => s.id)).toEqual(["bl", "br", "mr", "tr"]);
    expect(buildLabelBeltSlots(5).map((s) => s.id)).toEqual([
      "bl",
      "br",
      "mr",
      "tr",
      "tl",
    ]);
    expect(LABEL_BELT_FILL_ORDER).toEqual(["bl", "br", "mr", "tr", "tl", "ml"]);
  });

  it("uses ring order when all six slots are occupied", () => {
    const slots = buildLabelBeltSlots(LABEL_BELT_MAX_VISIBLE);
    expect(slots.map((s) => s.id)).toEqual([...LABEL_BELT_RING_ORDER]);
    expect(LABEL_BELT_RING_ORDER).toEqual(["bl", "br", "mr", "tr", "tl", "ml"]);
  });

  it("loads stop config for sides and tilts", () => {
    const slots = buildLabelBeltSlots(6);
    const byId = Object.fromEntries(slots.map((s) => [s.id, s]));
    expect(byId.bl!.side).toBe("left");
    expect(byId.bl!.stop).toEqual(LABEL_BELT_STOPS.bl);
    expect(byId.bl!.rotateDeg).toBe(-22);
    expect(byId.tl!.rotateDeg).toBe(22);
    expect(byId.ml!.rotateDeg).toBe(0);
    expect(byId.tr!.side).toBe("right");
    expect(byId.tr!.rotateDeg).toBe(-22);
    expect(byId.br!.rotateDeg).toBe(22);
    expect(byId.mr!.rotateDeg).toBe(0);
    expect(typeof LABEL_BELT_STOPS.bl.right).toBe("number");
    expect(typeof LABEL_BELT_STOPS.bl.top).toBe("number");
    expect(typeof LABEL_BELT_STOPS.tr.left).toBe("number");
    expect(typeof LABEL_BELT_STOPS.tr.top).toBe("number");
    // Lantern-facing pin: left column uses `right`, right column uses `left`.
    expect(LABEL_BELT_STOPS.bl.right).toBe(130);
    expect(LABEL_BELT_STOPS.tr.left).toBe(128);
  });

  it("walks ring neighbors for portal travel", () => {
    expect(labelBeltRingNeighbor("bl", 1)).toBe("br");
    expect(labelBeltRingNeighbor("br", 1)).toBe("mr");
    expect(labelBeltRingNeighbor("ml", 1)).toBe("bl");
    expect(labelBeltRingNeighbor("tl", -1)).toBe("tr");
    expect(labelBeltPortalAxisForMove("bl", "br")).toBe("y");
    expect(labelBeltPortalAxisForMove("tl", "tr")).toBe("y");
    expect(labelBeltPortalAxisForMove("br", "bl")).toBe("y");
  });

  it("rolls same-side slots together based on nav delta", () => {
    // Left arrow (prev / clockwise): left down, right up — animation unchanged
    expect(labelBeltPortalTravelSign("bl", -1)).toBe(1);
    expect(labelBeltPortalTravelSign("ml", -1)).toBe(1);
    expect(labelBeltPortalTravelSign("tl", -1)).toBe(1);
    expect(labelBeltPortalTravelSign("tr", -1)).toBe(-1);
    expect(labelBeltPortalTravelSign("mr", -1)).toBe(-1);
    expect(labelBeltPortalTravelSign("br", -1)).toBe(-1);
    // Right arrow (next / counter-clockwise): left up, right down
    expect(labelBeltPortalTravelSign("bl", 1)).toBe(-1);
    expect(labelBeltPortalTravelSign("ml", 1)).toBe(-1);
    expect(labelBeltPortalTravelSign("tl", 1)).toBe(-1);
    expect(labelBeltPortalTravelSign("tr", 1)).toBe(1);
    expect(labelBeltPortalTravelSign("mr", 1)).toBe(1);
    expect(labelBeltPortalTravelSign("br", 1)).toBe(1);
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
