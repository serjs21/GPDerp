import { createTypingPacer } from "./typingPacer";

const setup = (charDelay = 10) => {
  jest.useFakeTimers();
  const revealed: string[] = [];
  const pacer = createTypingPacer({
    onReveal: (piece) => revealed.push(piece),
    charDelayMs: () => charDelay,
    pieceSizes: [2, 3],
  });
  return { pacer, revealed };
};

describe("createTypingPacer", () => {
  afterEach(() => jest.useRealTimers());

  it("splits a big chunk into alternating 2/3-char pieces paced by the per-character delay", () => {
    const { pacer, revealed } = setup(10);
    pacer.push("Maple leaves");

    expect(revealed).toEqual(["Ma"]);
    jest.advanceTimersByTime(20);
    expect(revealed).toEqual(["Ma", "ple"]);
    jest.advanceTimersByTime(30);
    expect(revealed).toEqual(["Ma", "ple", " l"]);
    jest.advanceTimersByTime(1000);
    expect(revealed.join("")).toBe("Maple leaves");
    expect(revealed.map((p) => p.length)).toEqual([2, 3, 2, 3, 2]);
  });

  it("passes a slow one-char-at-a-time source through without extra delay", () => {
    const { pacer, revealed } = setup(10);
    pacer.push("a");
    expect(revealed).toEqual(["a"]);
    jest.advanceTimersByTime(25);
    pacer.push("b");
    expect(revealed).toEqual(["a", "b"]);
  });

  it("holds the first reveal, then types queued text", () => {
    const { pacer, revealed } = setup(10);
    pacer.holdFor(300);
    pacer.push("Rain");
    expect(revealed).toEqual([]);
    jest.advanceTimersByTime(300);
    expect(revealed).toEqual(["Ra"]);
  });

  it("runs drain callbacks only after the last piece and its delay", () => {
    const { pacer, revealed } = setup(10);
    const drained = jest.fn();
    pacer.push("abcde");
    pacer.whenDrained(drained);

    jest.advanceTimersByTime(20);
    expect(revealed.join("")).toBe("abcde");
    expect(drained).not.toHaveBeenCalled();
    jest.advanceTimersByTime(30);
    expect(drained).toHaveBeenCalledTimes(1);
  });

  it("runs drain callbacks immediately when idle, and dispose cancels pending work", () => {
    const { pacer, revealed } = setup(10);
    const drained = jest.fn();
    pacer.whenDrained(drained);
    expect(drained).toHaveBeenCalledTimes(1);

    pacer.push("abcdef");
    const late = jest.fn();
    pacer.whenDrained(late);
    pacer.dispose();
    jest.advanceTimersByTime(1000);
    expect(revealed).toEqual(["ab"]);
    expect(late).not.toHaveBeenCalled();
  });
});
