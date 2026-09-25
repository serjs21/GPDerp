import type { DateGraffitiPosition } from "@/components/DateGraffiti/utils/dateGraffitiStyleUtils";

/** Background stamp behind the comic burst on a manage-label preview panel. */
export const LABEL_PREVIEW_DATE_GRAFFITI = {
  size: "1.75rem",
  color: "color-mix(in srgb, var(--comic-ink, #2d2d2d) 20%, transparent)",
  position: {
    right: "0.4rem",
    bottom: "0.35rem",
    transform: "rotate(-9deg)",
  } satisfies DateGraffitiPosition,
} as const;
