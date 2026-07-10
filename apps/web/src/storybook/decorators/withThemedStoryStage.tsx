import type { Decorator } from "@storybook/nextjs-vite";
import {
  ThemedHaikuStoryStage,
  type ThemedStoryStageParameters,
} from "../ThemedHaikuStoryStage";

/**
 * Main-page celestial theme stage: CelestialThemeProvider + CelestialAppShell +
 * CelestialThemeSelector dial. Set `parameters.initialSlot` or `initialCelestialPreset`.
 */
export const withThemedStoryStage: Decorator = (Story, { parameters }) => {
  const stageParams = parameters as ThemedStoryStageParameters;

  return (
    <ThemedHaikuStoryStage
      initialSlot={stageParams.initialSlot}
      initialCelestialPreset={stageParams.initialCelestialPreset}
      wideContent={stageParams.wideContent}
    >
      <Story />
    </ThemedHaikuStoryStage>
  );
};
