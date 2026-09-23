import { getRotationBaseTransform } from "../consts/rotationBaseConsts";
import {
  buildRotationBaseRootStyle,
  mirroredFacePlane,
} from "./rotationBaseUtils";

describe("rotationBaseUtils", () => {
  it("mirrors face plane with reversed left + negated tilt/skew", () => {
    const base = getRotationBaseTransform("rotated");
    const face = mirroredFacePlane(base);

    expect(face.contentLeftPct).toBeCloseTo(100 - base.contentLeftPct);
    expect(face.rotateDeg).toBe(-base.rotateDeg);
    expect(face.skewXDeg).toBe(-base.skewXDeg);
    expect(face.skewYDeg).toBe(-base.skewYDeg);
  });

  it("applies mirrored face CSS vars without flipping content scaleX", () => {
    const transform = getRotationBaseTransform("rotated2");
    const style = buildRotationBaseRootStyle({
      widthRem: 14,
      transform,
      mirrored: true,
    });

    expect(style["--lantern-rotated-content-left"]).toBe(
      `${100 - transform.contentLeftPct}%`,
    );
    expect(style["--lantern-rotated-tilt"]).toBe(`${-transform.rotateDeg}deg`);
    expect(style["--lantern-rotated-skew-x"]).toBe(`${-transform.skewXDeg}deg`);
    expect(style["--lantern-rotated-skew-y"]).toBe(`${-transform.skewYDeg}deg`);
  });
});
