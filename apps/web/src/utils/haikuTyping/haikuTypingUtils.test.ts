// textTypingUtils pulls in ESM-only lodash-es, which this Jest setup does not transform.
jest.mock("@/components/TextTyping/utils/textTypingUtils", () => ({
  countTypingChunks: (text: string) => text.length,
}));

import {
  HAIKU_TYPING_CHAR_DELAY_MAX_MS,
  HAIKU_TYPING_CHAR_DELAY_MIN_MS,
  HAIKU_TYPING_STEP_MS,
} from "@/consts/haiku/haikuTypingConsts";
import { haikuTitleTypingDurationMs, haikuTypingCharDelayMs } from "./haikuTypingUtils";

describe("haikuTypingUtils", () => {
  it("draws per-character delays from the mock stream range", () => {
    expect(haikuTypingCharDelayMs(() => 0)).toBe(HAIKU_TYPING_CHAR_DELAY_MIN_MS);
    expect(haikuTypingCharDelayMs(() => 0.999999)).toBeCloseTo(HAIKU_TYPING_CHAR_DELAY_MAX_MS, 3);
  });

  it("types the title at one 2/3-char chunk per average piece (~63 ms)", () => {
    expect(HAIKU_TYPING_STEP_MS).toBe(63);
    expect(haikuTitleTypingDurationMs("abcd")).toBe(4 * HAIKU_TYPING_STEP_MS);
  });
});
