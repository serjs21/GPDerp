import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { manageLabelsAccountRoute, SettingsStoryPage, shareLinksRoute, withLoggedInAppLayout, withMockApi } from "@/storybook";

/** Settings › Share links (ShareLinkManagement) when the account has no share links. */
const meta = {
  title: "EmptyStatesReview/Share links",
  component: SettingsStoryPage,
  decorators: [withLoggedInAppLayout, withMockApi([manageLabelsAccountRoute, shareLinksRoute([])])],
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true, navigation: { pathname: "/settings", query: { tab: "share-links" } } },
  },
  args: { tab: "share-links" },
} satisfies Meta<typeof SettingsStoryPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No share links at all ("empty" copy under the sort and filters). */
export const NoShareLinks: Story = {};
