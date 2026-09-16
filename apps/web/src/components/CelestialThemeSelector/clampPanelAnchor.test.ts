import { clampPanelAnchor } from "./useCelestialSelectorOpenTransition";

describe("clampPanelAnchor", () => {
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;

  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 400 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 700 });
  });

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: originalInnerHeight,
    });
  });

  it("keeps a right-edge trigger panel fully inside the viewport", () => {
    const trigger = {
      left: 360,
      top: 8,
      right: 392,
      bottom: 40,
      width: 32,
      height: 32,
      x: 360,
      y: 8,
      toJSON: () => ({}),
    } as DOMRect;

    const anchor = clampPanelAnchor(trigger, 200, 200, 8, 8);

    expect(anchor.left).toBe(400 - 100 - 8);
    expect(anchor.left - 100).toBeGreaterThanOrEqual(8);
    expect(anchor.left + 100).toBeLessThanOrEqual(400 - 8);
    expect(anchor.top).toBe(48);
  });

  it("flips above the trigger when there is no room below", () => {
    const trigger = {
      left: 180,
      top: 600,
      right: 212,
      bottom: 632,
      width: 32,
      height: 32,
      x: 180,
      y: 600,
      toJSON: () => ({}),
    } as DOMRect;

    const anchor = clampPanelAnchor(trigger, 160, 160, 8, 8);

    expect(anchor.top + 160).toBeLessThanOrEqual(700 - 8);
    expect(anchor.top).toBeLessThan(trigger.top);
  });
});
