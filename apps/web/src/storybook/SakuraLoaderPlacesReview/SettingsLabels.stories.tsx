import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  labelsPagedRoute,
  labelsRoute,
  manageLabelsAccountRoute,
  pendingLabelsPagedRoute,
  pendingLabelsRoute,
  scrollToEnd,
  SettingsStoryPage,
  STORY_LABELS,
  withLoggedInAppLayout,
  withMockApi,
} from "@/storybook";

/** Settings › Labels (ManageLabelsPanel › ManageLabelsList), with the label requests held. */
const meta = {
  title: "SakuraLoaderPlacesReview/Settings labels",
  component: SettingsStoryPage,
  decorators: [withLoggedInAppLayout],
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true, navigation: { pathname: "/settings", query: { tab: "labels" } } },
  },
  args: { tab: "labels" },
} satisfies Meta<typeof SettingsStoryPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** ManageLabelsList: first-page loader. */
export const ListLoading: Story = {
  decorators: [withMockApi([manageLabelsAccountRoute, pendingLabelsPagedRoute(), pendingLabelsRoute()])],
};

/** ManageLabelsList: next-page loader (the play function scrolls the list to its end). */
export const NextPageLoading: Story = {
  decorators: [
    withMockApi([
      manageLabelsAccountRoute,
      labelsPagedRoute(STORY_LABELS, { total: 36, pendingAfterFirstPage: true }),
      labelsRoute(STORY_LABELS),
    ]),
  ],
  play: () => scrollToEnd('[class*="listScroll"]'),
};
