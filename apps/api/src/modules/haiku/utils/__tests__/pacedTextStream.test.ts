import { pacedTextStream } from "../pacedTextStream";

async function* from<T>(items: T[]) {
  for (const item of items) yield item;
}

const collect = async (stream: AsyncIterable<string>) => {
  const out: string[] = [];
  for await (const s of stream) out.push(s);
  return out;
};

describe("pacedTextStream", () => {
  it("re-emits multi-character chunks one code point at a time, sleeping between characters", async () => {
    const sleep = jest.fn().mockResolvedValue(undefined);
    const out = await collect(
      pacedTextStream(from(["Map", "le —", null, "🍁"]), { minDelayMs: 10, maxDelayMs: 40, random: () => 0.5, sleep }),
    );

    expect(out).toEqual(["M", "a", "p", "l", "e", " ", "—", "🍁"]);
    expect(sleep).toHaveBeenCalledTimes(out.length);
    expect(sleep).toHaveBeenCalledWith(25);
  });

  it("decodes multi-byte characters split across Buffer chunks", async () => {
    const dash = Buffer.from("a—b", "utf8");
    const out = await collect(
      pacedTextStream(from([dash.subarray(0, 2), dash.subarray(2)]), {
        minDelayMs: 0,
        maxDelayMs: 0,
        sleep: () => Promise.resolve(),
      }),
    );

    expect(out).toEqual(["a", "—", "b"]);
  });
});
