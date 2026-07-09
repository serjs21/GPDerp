import type { Decorator } from "@storybook/nextjs-vite";
import type { ThemeName } from "@/config/userConfiguration";
import { ThemeStage } from "../ThemeStage";

/** Applies theme CSS variables for haiku / lantern story stages. */
export function withThemeStage(theme: ThemeName = "night-sky"): Decorator {
  function withThemeStageDecorator(Story: Parameters<Decorator>[0]) {
    return (
      <ThemeStage theme={theme}>
        <Story />
      </ThemeStage>
    );
  }
  return withThemeStageDecorator;
}
