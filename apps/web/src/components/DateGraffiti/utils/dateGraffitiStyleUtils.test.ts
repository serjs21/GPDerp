import { buildDateGraffitiStyle } from "./dateGraffitiStyleUtils";

describe("buildDateGraffitiStyle", () => {
  it("returns undefined when nothing is configured", () => {
    expect(buildDateGraffitiStyle({})).toBeUndefined();
  });

  it("maps color, size, and position into a style object", () => {
    expect(
      buildDateGraffitiStyle({
        color: "#c44",
        size: "2rem",
        position: { right: "0.5rem", bottom: "0.25rem", transform: "rotate(-8deg)" },
      }),
    ).toEqual({
      color: "#c44",
      fontSize: "2rem",
      right: "0.5rem",
      bottom: "0.25rem",
      transform: "rotate(-8deg)",
    });
  });
});
