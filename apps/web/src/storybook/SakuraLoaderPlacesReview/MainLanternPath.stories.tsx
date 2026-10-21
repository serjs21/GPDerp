import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HomePageContent } from "@/app/HomePageContent";
import { SavedHaikusLanternPath } from "@/components/SavedHaikusLanternPath/SavedHaikusLanternPath";
import type { CelestialPresetName } from "@/theme/celestialPresets";
import {
  haikuListRoute,
  haikuSearchPendingRoute,
  manageLabelsAccountRoute,
  pendingRoute,
  withLoggedInAppLayout,
  withMockApi,
} from "@/storybook";
import { STORY_APP_VIEW_HAIKUS } from "@/storybook/decorators/withLoggedInAppLayout";

/** Member home page: the saved-haikus lantern path, with the haiku list requests held. */
const meta = {
  title: "SakuraLoaderPlacesReview/Main lantern path",
  component: HomePageContent,
  decorators: [withLoggedInAppLayout],
  parameters: {
    layout: "fullscreen",
    seedHaikus: false,
    initialCelestialPreset: "blueNight" satisfies CelestialPresetName,
    nextjs: { appDirectory: true, navigation: { pathname: "/" } },
  },
} satisfies Meta<typeof HomePageContent>;

export default meta;
type Story = StoryObj<typeof meta>;

/** SavedHaikusPathStatus: path loader while the first page of haikus loads. */
export const InitialLoading: Story = {
  decorators: [withMockApi([manageLabelsAccountRoute, pendingRoute("/haiku")])],
};

/** SavedHaikusPathStatus: "searching" loader while a header search is pending. */
export const SearchLoading: Story = {
  decorators: [withMockApi([manageLabelsAccountRoute, haikuSearchPendingRoute(STORY_APP_VIEW_HAIKUS)])],
  render: () => <SavedHaikusLanternPath searchString="moon" />,
};

/** SVGPathLanternBody: compact loaders in the path slots waiting for the next page of haikus. */
export const PathSlotsLoading: Story = {
  decorators: [
    withMockApi([
      manageLabelsAccountRoute,
      haikuListRoute(STORY_APP_VIEW_HAIKUS.slice(0, 3), { total: 30, pendingAfterFirstPage: true }),
    ]),
  ],
};
