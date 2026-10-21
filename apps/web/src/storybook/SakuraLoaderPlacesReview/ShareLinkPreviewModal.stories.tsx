import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ShareLinkPreviewModal } from "@/components/ShareLinkPreviewModal";
import { STORY_SHARE_LINKS, withLoggedInAppLayout } from "@/storybook";

const LINK = STORY_SHARE_LINKS[0];

/** ShareLinkPreviewModal (ShareLinkPreviewBody) over the app, opened from a share link before its haiku arrives. */
const meta = {
  title: "SakuraLoaderPlacesReview/Share link preview modal",
  component: ShareLinkPreviewModal,
  decorators: [withLoggedInAppLayout],
  parameters: { layout: "fullscreen" },
  args: {
    open: true,
    onOpenChange: () => undefined,
    subject: LINK.haikuSubject,
    shareUrl: LINK.shareUrl,
    haiku: undefined,
    loading: true,
    showLabels: LINK.showLabels,
    togglingLabels: false,
    onToggleLabels: () => undefined,
    onHaikuChanged: () => undefined,
  },
} satisfies Meta<typeof ShareLinkPreviewModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** ShareLinkPreviewBody: loader in the sky panel while the shared haiku loads. */
export const HaikuLoading: Story = {};
