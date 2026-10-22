import { setTimeout as delay } from "node:timers/promises";

export type SpacedChunkStreamOptions = {
  minIntervalMs: number;
  /** Injected for tests. */
  now?: () => number;
  sleep?: (ms: number) => Promise<unknown>;
};

/**
 * Forwards chunks unchanged, as they arrive, but never closer together than `minIntervalMs`.
 * The first chunk is never delayed; chunks that already arrive slower pass straight through.
 */
export async function* spacedChunkStream<T>(
  source: AsyncIterable<T>,
  { minIntervalMs, now = Date.now, sleep = delay }: SpacedChunkStreamOptions,
): AsyncGenerator<T> {
  let lastEmitAt: number | null = null;
  for await (const chunk of source) {
    if (lastEmitAt !== null) {
      const wait = lastEmitAt + minIntervalMs - now();
      if (wait > 0) await sleep(wait);
    }
    lastEmitAt = now();
    yield chunk;
  }
}
