import type { HaikuDto } from "@/api/haikus";
import type { LanternTransform } from "@/components/Lantern/lanternTransform";
import type { ParsedSplitPathSvg } from "./utils";

export type EmptyPathPlaceholderProps = {
  parsed: ParsedSplitPathSvg | null;
  /** The path is empty and the placeholder may show (not a filtered list with no matches). */
  eligible: boolean;
  /** A haiku is generating: the placeholder makes way for its lantern. */
  generating: boolean;
};

export type EmptyPathPlaceholderLanternProps = {
  haiku: HaikuDto;
  transform: LanternTransform;
  ariaLabel: string;
  isAnimating: boolean;
  /** Arrow down at the subject input; shown once the lantern is parked. */
  showArrow: boolean;
};

export type EnteringPlaceholderLanternProps = Pick<EmptyPathPlaceholderLanternProps, "haiku" | "ariaLabel"> & {
  parsed: ParsedSplitPathSvg;
  onComplete: () => void;
};

export type ParkedPlaceholderLanternProps = Pick<EmptyPathPlaceholderLanternProps, "haiku" | "ariaLabel"> & {
  parsed: ParsedSplitPathSvg;
  exiting: boolean;
  onExitComplete: () => void;
};
