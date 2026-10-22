import { StringDecoder } from "node:string_decoder";
import { setTimeout as delay } from "node:timers/promises";

export type PacedTextStreamOptions = {
  minDelayMs: number;
  maxDelayMs: number;
  /** Injected for tests. */
  random?: () => number;
  sleep?: (ms: number) => Promise<unknown>;
};

/**
 * Re-emits a text stream one character (code point) at a time with a random delay between characters,
 * so a model that returns everything at once still reaches the client as typing.
 */
export async function* pacedTextStream(
  source: AsyncIterable<string | Buffer | null>,
  { minDelayMs, maxDelayMs, random = Math.random, sleep = delay }: PacedTextStreamOptions,
): AsyncGenerator<string> {
  // Buffers from a byte-mode Node stream may split a multi-byte character across chunks.
  const decoder = new StringDecoder("utf8");
  const nextDelay = () => minDelayMs + random() * (maxDelayMs - minDelayMs);

  async function* characters(text: string) {
    for (const char of text) {
      yield char;
      await sleep(nextDelay());
    }
  }

  for await (const chunk of source) {
    if (chunk === null) continue;
    yield* characters(typeof chunk === "string" ? chunk : decoder.write(chunk));
  }
  yield* characters(decoder.end());
}
