import { buildCalloutPositionStyle } from "./calloutPositionUtils";

describe("buildCalloutPositionStyle", () => {
  it("returns undefined when position is omitted", () => {
    expect(buildCalloutPositionStyle()).toBeUndefined();
  });

  it("maps inset and transform fields", () => {
    expect(
      buildCalloutPositionStyle({
        left: "50%",
        top: "0",
        transform: "translate(-50%, -100%)",
      }),
    ).toEqual({
      left: "50%",
      top: "0",
      transform: "translate(-50%, -100%)",
    });
  });
});
