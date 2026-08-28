import {
  canStepBack,
  canStepForward,
  catchUpStopForHaiku,
  queueLoaderStop,
  shouldFetchNextQueuePage,
  stopForHaikuIndex,
} from "./stops";

describe("stops", () => {
  it("maps newest haiku to stop-20 at focus 0", () => {
    expect(stopForHaikuIndex(0, 0)).toBe(20);
    expect(stopForHaikuIndex(1, 0)).toBe(19);
  });

  it("leaves stop-20 empty at creation focus -1", () => {
    expect(stopForHaikuIndex(0, -1)).toBe(19);
    expect(stopForHaikuIndex(1, -1)).toBe(18);
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

  it("places the queue loader in the next slot behind the last haiku", () => {
    expect(queueLoaderStop(3, 0)).toBe(17);
    expect(queueLoaderStop(21, 0)).toBe(-1);
    expect(queueLoaderStop(21, 1)).toBe(0);
  });

  it("fetches when the next queue slot is an opaque empty stop", () => {
    expect(shouldFetchNextQueuePage(3, 0)).toBe(true);
    expect(shouldFetchNextQueuePage(21, 0)).toBe(false);
    expect(shouldFetchNextQueuePage(21, 1)).toBe(true);
  });

  it("packs catch-up haikus at the join stop then fans out", () => {
    expect(catchUpStopForHaiku(3, 3, 0, 0)).toBe(17);
    expect(catchUpStopForHaiku(4, 3, 0, 0)).toBe(17);
    expect(catchUpStopForHaiku(3, 3, 0, 1)).toBe(17);
    expect(catchUpStopForHaiku(4, 3, 0, 1)).toBe(16);
  });
});
