import { STYLE_NAVIGATION_WHEEL } from "@/components/StyleNavigationWheel/styleNavigationWheel.config";
import { styleNavigationStarRimAngleDeg } from "./styleNavigationStarRimAngle";

describe("styleNavigationStarRimAngleDeg", () => {
  it("matches the unrotated rim star when cosmic rotation is cancelled by offset alone", () => {
    const { leftPercent, topPercent } = STYLE_NAVIGATION_WHEEL.stars;
    const lx = leftPercent - 50;
    const ly = topPercent - 50;
    const localAngle = (Math.atan2(ly, lx) * 180) / Math.PI;

    // Find a slot whose cosmic rotation is ~0 (reference noon = 48).
    const noonAngle = styleNavigationStarRimAngleDeg(48);
    const expected =
      localAngle + STYLE_NAVIGATION_WHEEL.circleBaseRotationOffsetDeg;
    // Normalize both into (-180, 180]
    const norm = (deg: number) => {
      let d = ((deg + 180) % 360 + 360) % 360 - 180;
      return d;
    };
    expect(norm(noonAngle)).toBeCloseTo(norm(expected), 5);
  });

  it("advances when the slot rotates the circle base", () => {
    const a = styleNavigationStarRimAngleDeg(0);
    const b = styleNavigationStarRimAngleDeg(24);
    const delta = ((b - a) % 360 + 360) % 360;
    expect(delta).toBeCloseTo(90, 5);
  });
});
