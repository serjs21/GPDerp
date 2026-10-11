import type { HaikuDto } from "@/api/haikus";
import type { ShareLinkControls } from "@/components/ShareLink/useShareLinkControls";

export type ShareLinkLanternPanelControls = Pick<
  ShareLinkControls,
  | "subject"
  | "active"
  | "grayscale"
  | "copyEnabled"
  | "onCopy"
  | "hits"
  | "time"
  | "hitsLabel"
  | "timeLabel"
>;

export type ShareLinkLanternPanelProps = {
  ctrl: ShareLinkLanternPanelControls;
  /** Saved haiku; when missing a title-only placeholder lantern is shown. */
  haiku?: HaikuDto | null;
  /** Shows a loader instead of the placeholder lantern while the haiku loads. */
  loading?: boolean;
  /** Placeholder lantern id when `haiku` is missing. */
  fallbackId: string;
  /** Footer "Mfg" date; falls back to `haiku.createdAt`. */
  createdAt?: string | null;
  /** Extra class on the lantern ComicPagePanel. */
  className?: string;
};

export type ShareLinkLanternContentProps = {
  subject: string;
  haiku: HaikuDto | null;
  loading: boolean;
  fallbackId: string;
  createdAt: string | null;
};

export type ShareLinkLanternStatsProps = Pick<
  ShareLinkControls,
  "hits" | "time" | "hitsLabel" | "timeLabel"
>;
