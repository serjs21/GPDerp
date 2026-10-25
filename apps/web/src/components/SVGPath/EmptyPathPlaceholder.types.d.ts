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
  /** Skip the lantern's mount fade (a parent animation owns the entrance). */
  suppressReveal: boolean;
};

export type ShownPlaceholderLanternProps = Pick<EmptyPathPlaceholderLanternProps, "haiku" | "ariaLabel"> & {
  parsed: ParsedSplitPathSvg;
  /** Flying in along the creation path; parked on the focus stop once false. */
  entering: boolean;
  onEnterComplete: () => void;
};

export type ExitingPlaceholderLanternProps = Pick<EmptyPathPlaceholderLanternProps, "haiku"> & {
  parsed: ParsedSplitPathSvg;
  onExitComplete: () => void;
};
