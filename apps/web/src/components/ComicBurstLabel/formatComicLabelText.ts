/** Uppercase label copy with a trailing bang for comic-burst lettering. */
export function formatComicLabelText(text: string): string {
  return `${text.toUpperCase().trim()}!`;
}
