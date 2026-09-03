import { buildComicLabelCircleSlots, measureComicLabelCircleOrigins } from "./comicLabelCircleLayout";

describe("comicLabelCircleLayout", () => {
  it("builds five slots starting from top-left", () => {
    const labels = [
      { id: "a", name: "A", color: "#111" },
      { id: "b", name: "B", color: "#222" },
      { id: "c", name: "C", color: "#333" },
      { id: "d", name: "D", color: "#444" },
      { id: "e", name: "E", color: "#555" },
    ];

    const slots = buildComicLabelCircleSlots(labels, {
      startAngle: (-3 * Math.PI) / 4,
      radius: 0.35,
    });

    expect(slots).toHaveLength(5);
    expect(slots[0]!.x).toBeCloseTo(50 + Math.cos((-3 * Math.PI) / 4) * 35, 5);
    expect(slots[0]!.y).toBeCloseTo(50 + Math.sin((-3 * Math.PI) / 4) * 35, 5);
  });

  it("measures pixel origins from element sizes", () => {
    const stage = { clientWidth: 400, clientHeight: 400 } as HTMLElement;
    const slots = buildComicLabelCircleSlots(
      [{ id: "a", name: "A", color: "#111" }],
      { startAngle: 0, radius: 0.25 },
    );
    const el = { offsetWidth: 40, offsetHeight: 20 } as HTMLElement;
    const origins = measureComicLabelCircleOrigins(stage, slots, () => el);

    expect(origins.a).toEqual({
      left: 280,
      top: 190,
    });
  });
});
