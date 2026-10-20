import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { HaikuDto } from "@/api/haikus";
import { composeDecorators, withQueryClient, withThemedStoryStage } from "@/storybook";
import { ShareLinkPreviewModal } from "./ShareLinkPreviewModal";

const HAIKU: HaikuDto = {
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  title: "Safdawrf",
  titleSuffix: 0,
  body: "Infernal flames burn,\nWhispers echo endless pain—\nHope lost to the void.",
  createdAt: "2026-01-15T10:00:00.000Z",
  accountId: "acct",
  createdById: "user",
  labels: [],
};

const meta: Meta<typeof ShareLinkPreviewModal> = {
  title: "Tmp/PreviewMeasure",
  component: ShareLinkPreviewModal,
  parameters: { layout: "fullscreen" },
  decorators: [composeDecorators(withQueryClient, withThemedStoryStage)],
};
export default meta;

export const Open: StoryObj<typeof ShareLinkPreviewModal> = {
  args: {
    open: true,
    onOpenChange: () => {},
    subject: "Safdawrf",
    shareUrl: "https://example.com/share/x",
    haiku: HAIKU,
    showLabels: false,
    togglingLabels: false,
    onToggleLabels: () => {},
    onHaikuChanged: () => {},
  },
};
