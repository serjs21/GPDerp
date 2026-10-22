export type TypingPacerOptions = {
  /** Called with each revealed piece, in order. */
  onReveal: (piece: string) => void;
  /** Delay for one character (random per character, like the mock stream). */
  charDelayMs: () => number;
  /** Piece sizes to cycle through, e.g. [2, 3]. */
  pieceSizes: readonly number[];
  /** Injected for tests. */
  setTimer?: (callback: () => void, ms: number) => ReturnType<typeof setTimeout>;
  clearTimer?: (timer: ReturnType<typeof setTimeout>) => void;
};

export type TypingPacer = {
  /** Queue streamed text; reveals immediately when idle, otherwise after the pending piece's delay. */
  push: (text: string) => void;
  /** Delay the first reveal (e.g. until the title has typed in). No-op once revealing started. */
  holdFor: (ms: number) => void;
  /** Runs `callback` once everything queued so far has been revealed and its delay has elapsed. */
  whenDrained: (callback: () => void) => void;
  /** Stop timers and drop queued text and callbacks. */
  dispose: () => void;
};

/**
 * Reveals streamed text at a steady typing speed regardless of how it arrives: big model chunks are
 * split into small pieces, and a slow source (one char at a time) passes through at its own pace.
 */
export function createTypingPacer({
  onReveal,
  charDelayMs,
  pieceSizes,
  setTimer = (callback, ms) => setTimeout(callback, ms),
  clearTimer = (timer) => clearTimeout(timer),
}: TypingPacerOptions): TypingPacer {
  let queue: string[] = [];
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pieceIndex = 0;
  let drainCallbacks: Array<() => void> = [];

  const flushIfDrained = () => {
    if (queue.length > 0 || timer !== null) return;
    const callbacks = drainCallbacks;
    drainCallbacks = [];
    for (const callback of callbacks) callback();
  };

  const tick = () => {
    timer = null;
    if (queue.length === 0) {
      flushIfDrained();
      return;
    }
    const size = pieceSizes[pieceIndex % pieceSizes.length];
    pieceIndex += 1;
    const piece = queue.splice(0, size);
    onReveal(piece.join(""));
    const wait = piece.reduce((total) => total + charDelayMs(), 0);
    timer = setTimer(tick, wait);
  };

  return {
    push(text) {
      queue.push(...Array.from(text));
      if (timer === null) tick();
    },
    holdFor(ms) {
      if (timer !== null || pieceIndex > 0) return;
      timer = setTimer(tick, ms);
    },
    whenDrained(callback) {
      drainCallbacks.push(callback);
      flushIfDrained();
    },
    dispose() {
      if (timer !== null) clearTimer(timer);
      timer = null;
      queue = [];
      drainCallbacks = [];
    },
  };
}
