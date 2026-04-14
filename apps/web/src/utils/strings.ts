import type { HaikuDto } from "@/api/haikus";
import { capitalize } from 'lodash-es'

export const formatHaikuTitle = (haiku: HaikuDto, includeSuffix: boolean = true): string => {
  const normalizedTitle = capitalize(haiku.title.trim());
  if (haiku.titleSuffix <= 0 || !includeSuffix) return normalizedTitle;
  return `${normalizedTitle} (${haiku.titleSuffix})`;
};

export const formatHaikuPlainToText = (haiku: HaikuDto): string => {
  return `${formatHaikuTitle(haiku, false)}:\n\n${haiku.body.trim()}`;
};

export const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());