import type { HaikuDto } from "@/api/haikus";
import {
  EMPTY_PATH_PLACEHOLDER_ID,
  EMPTY_PATH_PLACEHOLDER_VARIANTS,
  type EmptyPathPlaceholderVariant,
} from "../consts/emptyPathPlaceholderConsts";

type Translate = (key: string) => string;

/** Placeholder lantern content for a variant; `t` is scoped to the `SVGPath` messages. */
export function emptyPathPlaceholderContent(variant: EmptyPathPlaceholderVariant, t: Translate) {
  const { messageKey, hasTitle, showArrow } = EMPTY_PATH_PLACEHOLDER_VARIANTS[variant];
  const haiku: HaikuDto = {
    id: `${EMPTY_PATH_PLACEHOLDER_ID}-${variant}`,
    title: hasTitle ? t(`${messageKey}.title`) : "",
    titleSuffix: 0,
    body: t(`${messageKey}.body`),
    createdAt: "",
    accountId: "",
    createdById: "",
    labels: [],
  };
  return { haiku, ariaLabel: t(`${messageKey}.ariaLabel`), showArrow };
}
