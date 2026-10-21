import { buildLoadingTextStyle } from "./loadingTextUtils";

describe("buildLoadingTextStyle", () => {
  it("cycles the bare word plus three dots, one per step", () => {
    expect(buildLoadingTextStyle(250)).toEqual({ "--loading-text-dots-duration": "1000ms" });
  });
});
