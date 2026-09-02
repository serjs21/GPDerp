import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ShareModal } from "./ShareModal";

const meta = {
  title: "Haiku/ShareModal",
  component: ShareModal,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    open: true,
    haikuId: "00000000-0000-4000-8000-000000000099",
    onClose: () => undefined,
    initialCreatedUrl: null,
    initialMethod: "link",
    initialLinkPolicy: "permanent",
  },
} satisfies Meta<typeof ShareModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LinkReady: Story = {
  args: {
    initialCreatedUrl: "https://example.com/share/demo-token-abc",
  },
};

export const ShareViaEmail: Story = {
  args: {
    initialMethod: "email",
  },
};

export const LimitedViewsSelected: Story = {
  args: {
    initialLinkPolicy: "limited",
  },
};

export const Closed: Story = {
  args: {
    open: false,
  },
};
