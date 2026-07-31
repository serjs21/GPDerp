"use client";

import { BackgroundSceneColorBalanceControls } from "./BackgroundSceneColorBalanceControls";
import type { ColorBalanceValues } from "./backgroundSceneColorBalance";

export type BackgroundSceneMountainColorBalanceControlsProps = {
  value: ColorBalanceValues;
  onChange: (next: ColorBalanceValues) => void;
};

export function BackgroundSceneMountainColorBalanceControls({
  value,
  onChange,
}: BackgroundSceneMountainColorBalanceControlsProps) {
  return (
    <BackgroundSceneColorBalanceControls
      title="Mountain color balance"
      resetLabel="Reset mountain balance"
      value={value}
      onChange={onChange}
    />
  );
}
