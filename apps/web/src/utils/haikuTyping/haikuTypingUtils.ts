import type { CSSProperties } from "react";
import { countTypingChunks } from "@/components/TextTyping/utils/textTypingUtils";
import {
  HAIKU_TYPING_CHAR_DELAY_MAX_MS,
  HAIKU_TYPING_CHAR_DELAY_MIN_MS,
  HAIKU_TYPING_STEP_MS,
} from "@/consts/haiku/haikuTypingConsts";

/** Random per-character delay, same distribution as the API mock stream. */
export const haikuTypingCharDelayMs = (random: () => number = Math.random): number =>
  HAIKU_TYPING_CHAR_DELAY_MIN_MS + random() * (HAIKU_TYPING_CHAR_DELAY_MAX_MS - HAIKU_TYPING_CHAR_DELAY_MIN_MS);

/** How long the generating title takes to type in (TextTyping chunks x step); the body starts after it. */
export const haikuTitleTypingDurationMs = (title: string): number =>
  countTypingChunks(title) * HAIKU_TYPING_STEP_MS;

/** Inherited TextTyping speed so the generating title types at the streamed-body speed. */
export const haikuTitleTypingStyle = (): CSSProperties =>
  ({ "--text-typing-step": `${HAIKU_TYPING_STEP_MS}ms` }) as CSSProperties;
