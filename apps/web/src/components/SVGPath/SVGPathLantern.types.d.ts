import type { CSSProperties, ReactNode } from "react";
import type { HaikuDto } from "@/api/haikus";
import type { LanternTransform } from "@/components/Lantern/lanternTransform";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import type { StopFace } from "./pathStopRotation";

export type SVGPathLanternProps = {
  haiku?: HaikuDto;
  generatingDraft?: GeneratingDraft | null;
  loading?: boolean;
  transform: LanternTransform;
  face?: StopFace;
  isAnimating?: boolean;
  /** Suppress lanternReveal (stepped hard cuts / idle remount after stepped). */
  suppressReveal?: boolean;
  /**
   * When true, this lantern is at the default/focus stop and may show actions
   * (combined with !isAnimating && !loading).
   */
  actionsAlwaysVisible?: boolean;
  excludeLabelIds?: string[];
  onDeleted?: (haiku: HaikuDto) => void;
  onDeleteFailed?: (haiku: HaikuDto) => void;
  onExitComplete?: (haiku: HaikuDto) => void;
  onChanged?: () => void;
};

export type RotatedStopFace = Extract<StopFace, { kind: "rotated" }>;

export type SVGPathLanternBodyProps = {
  haiku?: HaikuDto;
  generatingDraft?: GeneratingDraft | null;
  loading?: boolean;
  showActions: boolean;
  onDelete?: () => Promise<void>;
  onChanged?: () => void;
};

export type RotatedPathAnchorProps = {
  transform: LanternTransform;
  flightStyle?: CSSProperties;
  suppressReveal: boolean;
  isAnimating: boolean;
  ariaLabel: string;
  pathHaikuId?: string;
  children: ReactNode;
};

export type PathLanternWithHaloProps = {
  haiku: HaikuDto;
  transform: LanternTransform;
  flightStyle?: CSSProperties;
  lanternClass: string;
  exiting: boolean;
  ariaLabel: string;
  excludeLabelIds?: string[];
  interactive: boolean;
  onChanged?: () => void;
  children: ReactNode;
};

export type RotatedPathLanternWithHaloProps = {
  haiku: HaikuDto;
  transform: LanternTransform;
  flightStyle?: CSSProperties;
  suppressReveal: boolean;
  isAnimating: boolean;
  ariaLabel: string;
  face: RotatedStopFace;
  excludeLabelIds?: string[];
  interactive: boolean;
  showActions: boolean;
  onDelete?: () => Promise<void>;
  onChanged?: () => void;
};

/** Shared resolved state handed from SVGPathLantern to its saved / generating branches. */
export type PathLanternResolved = {
  transform: LanternTransform;
  face: StopFace;
  isAnimating: boolean;
  suppressReveal: boolean;
  ariaLabel: string;
  showActions: boolean;
  lanternClass: string;
};

export type SavedPathLanternProps = PathLanternResolved &
  Pick<
    SVGPathLanternProps,
    "excludeLabelIds" | "onDeleted" | "onDeleteFailed" | "onExitComplete" | "onChanged"
  > & {
    haiku: HaikuDto;
    loading: boolean;
  };

export type GeneratingPathLanternProps = PathLanternResolved & {
  generatingDraft: GeneratingDraft | null | undefined;
  loading: boolean;
};
