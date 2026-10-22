import { spacedChunkStream } from "../spacedChunkStream";

async function* timed(chunks: Array<[string, number]>, clock: { t: number }) {
  for (const [chunk, arrivesAt] of chunks) {
    clock.t = Math.max(clock.t, arrivesAt);
    yield chunk;
  }
}

describe("spacedChunkStream", () => {
  it("passes chunks through unchanged, spacing fast ones by the minimum interval", async () => {
    const clock = { t: 0 };
    const sleeps: number[] = [];
    const emittedAt: Array<[string, number]> = [];

    const stream = spacedChunkStream(
      timed(
        [
          ["Map", 1000],
          ["le", 1005],
          [" leaves", 1010],
          [" whisper", 1500],
        ],
        clock,
      ),
      {
        minIntervalMs: 60,
        now: () => clock.t,
        sleep: async (ms) => {
          sleeps.push(ms);
          clock.t += ms;
        },
      },
    );
    for await (const chunk of stream) emittedAt.push([chunk, clock.t]);

    expect(emittedAt).toEqual([
      ["Map", 1000],
      ["le", 1060],
      [" leaves", 1120],
      [" whisper", 1500],
    ]);
    // " leaves" was already waiting when "le" went out, so it gets the full interval.
    expect(sleeps).toEqual([55, 60]);
  });
});
