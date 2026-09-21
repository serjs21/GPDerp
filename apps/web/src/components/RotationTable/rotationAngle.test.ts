import {
  pointerAngleFromOriginDeg,
  shortestAngleDeltaDeg,
} from "./rotationAngle";

function rectAt(left: number, top: number, width: number, height: number): DOMRect {
  return {
    x: left,
    y: top,
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    toJSON: () => ({}),
  } as DOMRect;
}

describe("pointerAngleFromOriginDeg", () => {
  const origin = rectAt(100, 100, 200, 200); // center at (200, 200)

  it("returns 0° for pointer due right of center", () => {
    const { angleDeg, distance } = pointerAngleFromOriginDeg(300, 200, origin);
    expect(angleDeg).toBeCloseTo(0, 5);
    expect(distance).toBeCloseTo(100, 5);
  });

  it("returns 90° for pointer due below center", () => {
    const { angleDeg } = pointerAngleFromOriginDeg(200, 300, origin);
    expect(angleDeg).toBeCloseTo(90, 5);
  });

  it("returns -90° for pointer due above center", () => {
    const { angleDeg } = pointerAngleFromOriginDeg(200, 100, origin);
    expect(angleDeg).toBeCloseTo(-90, 5);
  });

  it("returns ±180° for pointer due left of center", () => {
    const { angleDeg } = pointerAngleFromOriginDeg(100, 200, origin);
    expect(Math.abs(angleDeg)).toBeCloseTo(180, 5);
  });
});

describe("shortestAngleDeltaDeg", () => {
  it("unwraps across the ±180 boundary", () => {
    expect(shortestAngleDeltaDeg(170, -170)).toBeCloseTo(20, 5);
    expect(shortestAngleDeltaDeg(-170, 170)).toBeCloseTo(-20, 5);
  });

  it("returns zero for identical angles", () => {
    expect(shortestAngleDeltaDeg(45, 45)).toBe(0);
  });
});
