/** Stable id for the placeholder lantern (also seeds its delete-flight poses). */
export const EMPTY_PATH_PLACEHOLDER_ID = "empty-path-placeholder";

/** Arrow on the placeholder lantern's paper, pointing down at the subject input (drawn pointing right). */
export const EMPTY_PATH_PLACEHOLDER_ARROW_SRC = "/empty-state/arrow.svg";

export type EmptyPathPlaceholderVariant = "createFirst" | "verifyEmail";

/**
 * Per variant: the `SVGPath.<messageKey>` messages (`body`, `ariaLabel`, plus `title` when `hasTitle`)
 * and whether the arrow points down at what sits below the path.
 */
export const EMPTY_PATH_PLACEHOLDER_VARIANTS: Record<
  EmptyPathPlaceholderVariant,
  { messageKey: string; hasTitle: boolean; showArrow: boolean }
> = {
  /** No haikus yet: points at the subject input. */
  createFirst: { messageKey: "emptyPlaceholder", hasTitle: false, showArrow: true },
  /** Email not verified: points at the resend button. */
  verifyEmail: { messageKey: "verifyEmailPlaceholder", hasTitle: true, showArrow: true },
};
