import type { HaikuDto } from "@/api/haikus";

/** Mfg footer date: the saved haiku's creation date, else the link's. */
export function lanternPanelFooterDate(haiku: HaikuDto | null | undefined, createdAt: string | null | undefined) {
  return haiku?.createdAt ?? createdAt;
}

export function lanternPanelClassName(
  styles: Record<string, string>,
  grayscale: boolean,
  className: string | undefined,
) {
  return [styles.panel, grayscale ? styles.inactive : styles.active, className].filter(Boolean).join(" ");
}
