import type { Decorator } from "@storybook/nextjs-vite";

/**
 * Compose Storybook decorators left-to-right (outermost first).
 * `composeDecorators(withQueryClient, withThemeStage)` → QueryClient wraps ThemeStage.
 */
export function composeDecorators(...decorators: Decorator[]): Decorator {
  return (Story, context) => {
    let render = Story;
    for (let i = decorators.length - 1; i >= 0; i -= 1) {
      const decorator = decorators[i];
      const inner = render;
      render = () => decorator(inner, context);
    }
    return render();
  };
}
