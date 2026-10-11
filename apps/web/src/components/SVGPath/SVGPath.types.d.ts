import type { RefObject } from "react";
import type { HaikuDto } from "@/api/haikus";
import type { LanternTransform } from "@/components/Lantern/lanternTransform";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import type { StopFace } from "./pathStopRotation";
import type { ParsedSplitPathSvg } from "./utils";

export type CreationLayerState = {
  requestId: string;
  draft: GeneratingDraft | null;
  /** Far-path: keep showing saved haiku under modal chrome after stream ends. */
  handoffHaiku: HaikuDto | null;
  /** Kept at 1 while mounted; overlay unmounts instantly on near-path handoff. */
  overlayOpacity: number;
};

export type ExitingLantern = {
  haiku: HaikuDto;
  transform: LanternTransform;
};

/** Snapshot used to tween lanterns from pre-delete indices to compacted indices. */
export type DeletePack = {
  /** haikuId → index before deletion */
  prevIndexById: Map<string, number>;
};

export type SplitPathSvg = {
  parsed: ParsedSplitPathSvg;
  guideInner: string;
};

export type SvgPathVisibleLantern = {
  haiku?: HaikuDto;
  haikuIndex: number;
  loading: boolean;
  transform: LanternTransform;
  face: StopFace;
};

export type SvgPathGuideProps = {
  splitPath: SplitPathSvg | null;
};

export type SvgPathListLanternProps = {
  entry: SvgPathVisibleLantern;
  focusIndex: number;
  /** Far-path: creation overlay owns stop-20; hide the list lantern underneath. */
  hideListFocusStop: boolean;
  isAnimating: boolean;
  excludeLabelIds?: string[];
  onLanternDeleted: (haiku: HaikuDto, transform: LanternTransform) => void;
  onHaikuDeleteFailed?: (haiku: HaikuDto) => void;
  onHaikuChanged?: () => void;
};

export type HaikusRef = RefObject<HaikuDto[]>;
