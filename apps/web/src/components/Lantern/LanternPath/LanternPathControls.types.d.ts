export type LanternPathControlsProps = {
  focusIndex: number;
  haikuCount: number;
  canStepBack: boolean;
  canStepForward: boolean;
  onStepBack: () => void;
  onStepForward: () => void;
};
