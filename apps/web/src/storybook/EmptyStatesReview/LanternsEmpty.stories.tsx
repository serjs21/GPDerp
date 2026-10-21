import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HomePageContent } from "@/app/HomePageContent";
import type { CelestialPresetName } from "@/theme/celestialPresets";
import { haikuListRoute, manageLabelsAccountRoute, withLoggedInAppLayout, withMockApi } from "@/storybook";

/** Member home page (saved-haikus lantern path) for an account with no haikus yet. */
const meta = {
  title: "EmptyStatesReview/Lanterns",
  component: HomePageContent,
  decorators: [withLoggedInAppLayout, withMockApi([manageLabelsAccountRoute, haikuListRoute([])])],
  parameters: {
    layout: "fullscreen",
    seedHaikus: false,
    initialCelestialPreset: "blueNight" satisfies CelestialPresetName,
    nextjs: { appDirectory: true, navigation: { pathname: "/" } },
  },
} satisfies Meta<typeof HomePageContent>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No saved haikus: the path with no lanterns, ready for the first one. */
export const NoHaikus: Story = {};
