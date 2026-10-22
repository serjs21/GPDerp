import type { HaikuDto } from "@/api/haikus";
import { capitalize } from 'lodash-es'

/** Display transform for a haiku title (saved titles and the generating lantern's subject). */
export const formatHaikuTitleText = (title: string): string => capitalize(title.trim());

export const formatHaikuTitle = (haiku: HaikuDto, includeSuffix: boolean = true): string => {
  const normalizedTitle = formatHaikuTitleText(haiku.title);
  if (haiku.titleSuffix <= 0 || !includeSuffix) return normalizedTitle;
  return `${normalizedTitle} (${haiku.titleSuffix})`;
};

export const formatHaikuPlainToText = (haiku: HaikuDto): string => {
  return `${formatHaikuTitle(haiku, false)}:\n\n${haiku.body.trim()}`;
};
