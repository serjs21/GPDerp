import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import ManageLabelsPage from "@/app/manage_labels/page";
import {
  labelsPagedRoute,
  labelsRoute,
  manageLabelsAccountRoute,
  pendingLabelsPagedRoute,
  pendingLabelsRoute,
  pendingRoute,
  scrollToEnd,
  STORY_LABELS,
  withLoggedInAppLayout,
  withMockApi,
} from "@/storybook";

/** /manage_labels page: account lookup, then ManageLabelsPanel. */
const meta = {
  title: "SakuraLoaderPlacesReview/Manage labels page",
  component: ManageLabelsPage,
  decorators: [withLoggedInAppLayout],
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true, navigation: { pathname: "/manage_labels" } },
  },
} satisfies Meta<typeof ManageLabelsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Page loader while the manage-labels account resolves. */
export const AccountLoading: Story = {
  decorators: [withMockApi([pendingRoute("/haiku/manage_labels/account")])],
};

/** ManageLabelsList first-page loader inside the page. */
export const ListLoading: Story = {
  decorators: [withMockApi([manageLabelsAccountRoute, pendingLabelsPagedRoute(), pendingLabelsRoute()])],
};

/** ManageLabelsList next-page loader (the play function scrolls the list to its end). */
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
