import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  composeDecorators,
  withMockAuthentication,
  withQueryClient,
} from "@/storybook";

import { ShareModal } from "./ShareModal";

const meta = {
  title: "Haiku/ShareModal",
  component: ShareModal,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [composeDecorators(withQueryClient, withMockAuthentication)],
  args: {
    open: true,
    haikuId: "00000000-0000-4000-8000-000000000099",
    haikuSubject: "Morning mist on the mountain path",
    onClose: () => undefined,
    initialCreatedUrl: null,
    initialMethod: "link",
    initialEmptyLink: true,
  },
} satisfies Meta<typeof ShareModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LinkActive: Story = {
  args: {
    initialEmptyLink: false,
    initialCreatedLink: {
      id: "11111111-1111-4111-8111-111111111111",
      shareHash: "demo-token-abc",
      shareUrl: "https://example.com/share/demo-token-abc",
      sharedHaikuId: "00000000-0000-4000-8000-000000000099",
      haikuSubject: "Morning mist on the mountain path",
      createdAt: "2026-01-15T10:00:00.000Z",
      expirationDate: null,
      maxViews: null,
      viewCount: 0,
      disabled: false,
    },
  },
};

export const LinkStopped: Story = {
  args: {
    initialEmptyLink: false,
    initialCreatedLink: {
      id: "22222222-2222-4222-8222-222222222222",
      shareHash: "demo-token-stopped",
      shareUrl: "https://example.com/share/demo-token-stopped",
      sharedHaikuId: "00000000-0000-4000-8000-000000000099",
      haikuSubject: "Morning mist on the mountain path",
      createdAt: "2026-01-15T10:00:00.000Z",
      expirationDate: null,
      maxViews: null,
      viewCount: 0,
      disabled: true,
    },
  },
};

export const ShareViaEmail: Story = {
  args: {
    initialMethod: "email",
  },
};

export const EmailSendReady: Story = {
  args: {
    initialMethod: "email",
    initialEmailRecipients: ["friend@example.com"],
  },
};

export const Closed: Story = {
  args: {
    open: false,
  },
};
