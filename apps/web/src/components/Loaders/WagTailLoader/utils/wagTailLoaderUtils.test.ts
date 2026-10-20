import { linesStyle, tailOpacityAt } from "./wagTailLoaderUtils";

const OPACITIES = [0.6, 1, 0.8, 0.5] as const;
const frame = (jump: number, tick: number) => [0, 1, 2, 3].map((index) => tailOpacityAt(OPACITIES, jump, index, tick));

describe("tailOpacityAt", () => {
  it("starts every copy on its own slot of the pattern", () => {
    expect(frame(3, 0)).toEqual([0.6, 1, 0.8, 0.5]);
  });

  it("moves the pattern three copies per tick", () => {
    expect(frame(3, 1)).toEqual([0.5, 0.6, 1, 0.8]);
    expect(frame(3, 2)).toEqual([0.8, 0.5, 0.6, 1]);
    expect(frame(3, 3)).toEqual([1, 0.8, 0.5, 0.6]);
    expect(frame(3, 4)).toEqual(frame(3, 0));
  });

  it("supports a single-copy jump", () => {
    expect(frame(1, 1)).toEqual([1, 0.8, 0.5, 0.6]);
  });
});

describe("linesStyle", () => {
  it("steps the motion lines through linesOpacities by the jump size", () => {
    expect(linesStyle({ linesOpacities: OPACITIES, linesOpacityJumpSteps: 3 })).toEqual({
      "--wag-c0": "0.6",
      "--wag-c1": "0.5",
      "--wag-c2": "0.8",
      "--wag-c3": "1",
    });
  });
});
