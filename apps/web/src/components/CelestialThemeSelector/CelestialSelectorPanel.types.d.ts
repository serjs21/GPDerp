import type { CSSProperties, RefObject } from "react";
import type { CelestialThemeClockHandle } from "@/components/CelestialThemeClock";
import type { GeoCoordinates } from "@/theme/celestialTheme";
import type { CelestialSelectorPanelAnchor } from "./useCelestialSelectorOpenTransition";

export type CelestialSelectorPanelProps = {
  panelRef: RefObject<HTMLDivElement | null>;
  panelPopRef: RefObject<HTMLDivElement | null>;
  panelChromeRef: RefObject<HTMLDivElement | null>;
  panelContentRef: RefObject<HTMLDivElement | null>;
  ringRef: RefObject<SVGCircleElement | null>;
  clockRef: RefObject<CelestialThemeClockHandle | null>;
  anchor: CelestialSelectorPanelAnchor;
  sceneStyle?: CSSProperties;
  ariaLabel: string;
  slot: number;
  coordinates: GeoCoordinates;
  onPreview: (slot: number) => void;
  onCommit: (slot: number) => void;
};
