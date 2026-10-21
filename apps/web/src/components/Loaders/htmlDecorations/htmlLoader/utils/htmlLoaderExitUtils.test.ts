import { complementClipPath } from "./htmlLoaderExitUtils";

describe("complementClipPath", () => {
  it("cuts the polygon out of the full box with the even-odd rule", () => {
    expect(complementClipPath("polygon(900px 0px, 1280px 0px, 1280px 800px, 700px 800px)")).toBe(
      "polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, 900px 0px, 1280px 0px, 1280px 800px, 700px 800px, 900px 0px, 0 0)",
    );
  });

  it("cuts nothing when there is no polygon", () => {
    expect(complementClipPath("")).toBe("none");
    expect(complementClipPath("none")).toBe("none");
    expect(complementClipPath("polygon(1px 2px, 3px 4px)")).toBe("none");
  });
});
