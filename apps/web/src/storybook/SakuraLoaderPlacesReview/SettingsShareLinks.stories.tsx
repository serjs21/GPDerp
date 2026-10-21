import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  haikuBatchRoute,
  manageLabelsAccountRoute,
  pendingRoute,
  scrollToEnd,
  SettingsStoryPage,
  shareLinksRoute,
  STORY_SHARE_LINKS,
  STORY_SHARED_HAIKUS,
  withLoggedInAppLayout,
  withMockApi,
} from "@/storybook";

/** Settings › Share links (ShareLinkManagement), with the list requests held so each loader stays up. */
const meta = {
  title: "SakuraLoaderPlacesReview/Settings share links",
  component: SettingsStoryPage,
  decorators: [withLoggedInAppLayout],
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true, navigation: { pathname: "/settings", query: { tab: "share-links" } } },
  },
  args: { tab: "share-links" },
} satisfies Meta<typeof SettingsStoryPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** ShareLinkManagement: centered loader while the first page of share links loads. */
export const ListLoading: Story = {
  decorators: [withMockApi([manageLabelsAccountRoute, pendingRoute("/share_links")])],
};

/**
 * ShareLinkManagement: bottom loader while the next page loads (first page answered, more reported).
 * The play function scrolls the list to its end so the end-of-list sentinel requests the next page.
 */
export const NextPageLoading: Story = {
  decorators: [
    withMockApi([
      manageLabelsAccountRoute,
      shareLinksRoute(STORY_SHARE_LINKS, { total: 60, pendingAfterFirstPage: true }),
      haikuBatchRoute(STORY_SHARED_HAIKUS),
    ]),
  ],
  play: () => scrollToEnd('[class*="listShell"]'),
};

/** ShareLinkLanternPanel (ShareLinkLanternContent): each row's lantern loader while the shared haikus load. */
export const RowLanternsLoading: Story = {
  decorators: [withMockApi([manageLabelsAccountRoute, shareLinksRoute(STORY_SHARE_LINKS), pendingRoute("/haiku/batch", "post")])],
};
