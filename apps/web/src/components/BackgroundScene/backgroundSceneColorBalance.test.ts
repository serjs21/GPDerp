import {
  colorBalanceToMatrix,
  DEFAULT_COLOR_BALANCE,
  normalizeColorBalance,
} from "./backgroundSceneColorBalance";

describe("backgroundSceneColorBalance", () => {
  it("returns identity matrix at zero sliders", () => {
    expect(colorBalanceToMatrix(DEFAULT_COLOR_BALANCE)).toBe(
      "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0",
    );
  });

  it("maps non-zero sliders to channel offsets", () => {
    const matrix = colorBalanceToMatrix({
      cyanRed: 40,
      magentaGreen: -20,
      yellowBlue: 60,
    });

    expect(matrix).toContain("0.2");
    expect(matrix).toContain("-0.1");
    expect(matrix).toContain("0.3");
  });

  it("emits twenty numeric matrix values", () => {
    const values = colorBalanceToMatrix({
      cyanRed: 10,
      magentaGreen: 10,
      yellowBlue: 10,
    }).split(" ");

    expect(values).toHaveLength(20);
    expect(values.every((value) => !Number.isNaN(Number(value)))).toBe(true);
  });

  it("clamps slider input", () => {
    expect(
      normalizeColorBalance({ cyanRed: 200, magentaGreen: -200, yellowBlue: 50 }),
    ).toEqual({
      cyanRed: 100,
      magentaGreen: -100,
      yellowBlue: 50,
    });
  });
});
