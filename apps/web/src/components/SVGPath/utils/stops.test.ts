import {
  canStepBack,
  canStepForward,
  stopForHaikuIndex,
} from "./stops";

describe("stops", () => {
  it("maps newest haiku to stop-20 at focus 0", () => {
    expect(stopForHaikuIndex(0, 0)).toBe(20);
    expect(stopForHaikuIndex(1, 0)).toBe(19);
  });

  it("moves the newest haiku to stop-21 when focus is 1", () => {
    expect(stopForHaikuIndex(0, 1)).toBe(21);
    expect(stopForHaikuIndex(1, 1)).toBe(20);
  });

  it("blocks back-scroll when the first lantern is on stop-20", () => {
    expect(canStepBack(0)).toBe(false);
    expect(canStepBack(1)).toBe(true);
  });

  it("blocks forward-scroll when the last lantern is on stop-20", () => {
    expect(canStepForward(0, 1)).toBe(false);
    expect(canStepForward(2, 3)).toBe(false);
    expect(canStepForward(0, 3)).toBe(true);
  });
});
