import { waitForSettledContent } from "./waitForSettledContent";

jest.mock("./waitForRenderedAssets", () => ({
  waitForRenderedAssets: jest.fn(() => Promise.resolve()),
}));

const { waitForRenderedAssets } = jest.requireMock("./waitForRenderedAssets") as {
  waitForRenderedAssets: jest.Mock;
};

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

function trackSettled(root: HTMLElement, signal = new AbortController().signal) {
  const state = { settled: false };
  void waitForSettledContent(root, signal).then(() => {
    state.settled = true;
  });
  return state;
}

describe("waitForSettledContent", () => {
  beforeEach(() => waitForRenderedAssets.mockClear());

  it("settles right after the assets when nothing is busy", async () => {
    const root = document.createElement("main");
    const state = trackSettled(root);
    await flush();
    expect(state.settled).toBe(true);
    expect(waitForRenderedAssets).toHaveBeenCalledWith(root);
  });

  it("waits until busy descendants and a loading page clear", async () => {
    const root = document.createElement("main");
    root.dataset.visualReady = "loading";
    const list = document.createElement("div");
    list.setAttribute("aria-busy", "true");
    root.append(list);

    const state = trackSettled(root);
    await flush();
    expect(state.settled).toBe(false);

    root.dataset.visualReady = "ready";
    await flush();
    expect(state.settled).toBe(false);

    list.setAttribute("aria-busy", "false");
    await flush();
    expect(state.settled).toBe(true);
    expect(waitForRenderedAssets).toHaveBeenCalledTimes(1);
  });

  it("waits again when content turns busy while its assets load", async () => {
    const root = document.createElement("main");
    const late = document.createElement("div");
    waitForRenderedAssets.mockImplementationOnce(() => {
      late.setAttribute("aria-busy", "true");
      root.append(late);
      return Promise.resolve();
    });

    const state = trackSettled(root);
    await flush();
    expect(state.settled).toBe(false);

    late.remove();
    await flush();
    expect(state.settled).toBe(true);
    expect(waitForRenderedAssets).toHaveBeenCalledTimes(2);
  });

  it("stops waiting when aborted", async () => {
    const root = document.createElement("main");
    root.setAttribute("aria-busy", "true");
    const controller = new AbortController();
    const state = trackSettled(root, controller.signal);
    await flush();
    expect(state.settled).toBe(false);

    controller.abort();
    await flush();
    expect(state.settled).toBe(true);
    expect(waitForRenderedAssets).not.toHaveBeenCalled();
  });
});
